const jws = require('jws');
const jwt = require('jsonwebtoken');
const jwktopem = require('jwk-to-pem');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const privateKey = fs.readFileSync(path.resolve(__dirname, '../cert/privateKey.txt'))

async function jwsSignature(data) {
    try {
  
        const encryptedBody = jws.sign({
            header: { alg: 'RS256' },
            payload: data,
            privateKey: privateKey              // private key for signing the request body
        })
  
        const [header, body, signature] = encryptedBody.split('.');
        const detachedJws = `${header}.${signature}`;
  
        return { error: false, "header": detachedJws, "body": body };
  
    } catch (err) {
        return {error: true, message: err.message};
    }
}
  
//Get Token from OCEN Auth Component
const getAccessToken = async (clientId, clientSecret) => {
    const ocenAccessTokenUrl = "https://auth.ocen.network/realms/dev/protocol/openid-connect/token"

    const requestBody = {
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
    };

    try {
        const response = await axios.post(ocenAccessTokenUrl, requestBody, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });
        if (response.status == 200) {
            
            const storeTokenData = response.data;
            return {error: false, storeTokenData};
        } else {
            return {error: true, message: 'Failed to generate access token'};
        }
    } catch (error) {
        
        let errorMessage = error?.response?.data?.error || 'Failed to generate access token'
        return {error: true, message: errorMessage};
    }
};
  
const validateToken = async (authToken) => {
    try {
        if (!authToken) return { error: true, message: "No token provided" };
        
        if (authToken.startsWith('Bearer ')) authToken = authToken.slice(7, authToken.length);
        
        const decodedToken = jwt.decode(authToken, { complete: true });
        const decodedTokenKid = decodedToken.header.kid;
        
        let publicKey;

        const url = "https://auth.ocen.network/realms/dev/protocol/openid-connect/certs"
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });

        const fetchResponse = response.data.keys;

        for (let data of fetchResponse) {
            if (decodedTokenKid === data.kid) {
                publicKey = jwktopem(data);
                break;
            }
        }

        if (!publicKey) {
            return { error: true, message: "Public key not found for the given Key ID" };
        }

        const verifiedToken = jwt.verify(authToken, publicKey, { algorithms: ['RS256'] });
        const { exp, iat, azp, participantId } = verifiedToken;
        
        //get clientDetails
        const clientDetail = await getClientDetail(participantId, authToken)
        if (clientDetail.error == true) return { error: true, message: clientDetail.message };

        if (exp <= iat && (new Date() > new Date(1000 * exp))) return { error: true, message: "Token expired" };
        if (azp !== clientDetail.storeClientData.kcClientId) return { error: true, message: "Unauthorized party" };

        return { error: false, message: "Token Verified" }

    } catch (err) {
        return { error: true, message: err?.message || "Internal Server Error" };
    }
}
  
const getClientDetail = async (participantId, token) => {

    try {

        const url = `https://dev.ocen.network/service/participant-roles/${participantId}`
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status == 200) {
            const storeClientData = response.data;
            return {error: false, storeClientData};
        } else {
            return {error: true, message: 'Failed to get client data'};
        }
    } catch (error) {

        let errorMessage = error?.response?.data?.error || 'Failed to get client data'
        return {error: true, message: errorMessage};
    }
};
  
const validateSignature = async (authToken, signatureData) => {
    try {

        if (!authToken) return { error: true, message: "No token provided" };
        
        if (authToken.startsWith('Bearer ')) authToken = authToken.slice(7, authToken.length);
        
        const decodedToken = jwt.decode(authToken, { complete: true });
        const participantId = decodedToken.payload.participantId;

        //get clientDetails
        const clientDetail = await getClientDetail(participantId, authToken)
        if (clientDetail.error == true) return { error: true, message: clientDetail.message };
        
        const clientPublicKey = JSON.parse(clientDetail.storeClientData.publicKey)
        
        const participantPublicKey = jwktopem(clientPublicKey)
        

        if (signatureData.signature && signatureData.payload) {
            const payload = signatureData.payload
            const [header, signature] = signatureData.signature.split(".")
            const token = `${header}.${payload}.${signature}`;

            const getVerifyData = jwt.verify(token, participantPublicKey, async (err, decoded) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        return 'Token expired';
                    }
                    return 'Invalid token';
                }

                return {error: false, data: decoded.data};
            });
            return getVerifyData  
        }
    } catch (err) {
        return { error: true, message: err.message };
    }
}


module.exports = {
    jwsSignature, getAccessToken, validateToken, validateSignature
}