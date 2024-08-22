
const { jwsSignature, getAccessToken, validateToken, validateSignature } = require('../helper/common.helper')

const getHeaders = async (req, res) => {
  try {
    const payload = req.body

    const clientId = req.headers.clientid;
    const clientSecret = req.headers.clientsecret;
    if (!clientId || !clientSecret) return res.status(400).send("Client Id and Client Secret is Required");

    const authTokenDetails = await getAccessToken(clientId, clientSecret)
    if (authTokenDetails.error == true) return res.status(400).send(authTokenDetails.message);

    const signedPayload = await jwsSignature(payload)
    if (signedPayload.error == true) return res.status(400).send(signedPayload.message);

    const requestBody = {
      payload: signedPayload.body
    };
    const requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authTokenDetails.storeTokenData.access_token}`,
        'Signature': signedPayload.header
    };

    res.status(200).send({ statusCode: 100, requestHeaders: requestHeaders, requestPayload: requestBody });

  } catch (e) {

    let responsePayload = {
      "ack": {
        "error": e.message,
        "timestamp": new Date()
      }
    } 
    res.status(500).send(responsePayload);
  }
}

const vatidateHeaders = async (req, res) => {
  try {

    let authToken = req.headers.authorization;
    if (!authToken) return res.status(400).send("Authorization Token is Required");

    const signatureData = {
      signature: req.headers.signature,
      payload: req.body.payload
    }
    if (!signatureData.signature || !signatureData.payload) return res.status(400).send("Payload and Signature Header are Required");

    const validateTokenResult = await validateToken(authToken)
    if (validateTokenResult.error == true) {
      return res.status(400).send( validateTokenResult.message );
    }

    const validateSignatureResult = await validateSignature(authToken, signatureData)
    if (validateSignatureResult.error == true) {
      return res.status(400).send( validateSignatureResult.message );
    }

    return res.status(200).send({ statusCode: 100, validateTokenResult, validateSignatureResult });
  } catch (e) {

    let responsePayload = {
      "ack": {
        "error": e.message,
        "timestamp": new Date()
      }
    }
    
    res.status(500).send(responsePayload);
  }
  
}


module.exports = {
  getHeaders,
  vatidateHeaders
}