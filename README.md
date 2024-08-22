**ocen_auth**
This project demonstrates interacting with the OCEN auth service and registry.

// API ClientID and Secret for credential based Authorization Token Generation

clientid=f59adada-ea8d-4f8c-b511-4161fd216c49

clientsecret=LGweLUAP7OEryjiQQK4byGppswSJYIph

Private key used to sign the payload is in the app/cert folder 'privateKey.txt'

There are 2 APIs:
1. /partnerAPI/v4.0.0alpha/getAPIHeaders
   Provide clientid & clientsecret in the headers. Provide JSON object in the Body. This API gets authorization token from OCEN registry in return of clientid & clientsecret and also provide signed payload using the private key.
   
2. /partnerAPI/v4.0.0alpha/vatidateAPIHeaders
   This API is used to validate the authorization token and validate the signed payload.

