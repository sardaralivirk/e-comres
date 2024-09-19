import { google, GoogleApis } from "googleapis";
const googleClintId=process.env.client_id
const googleSecretId=process.env.client_secret
export const Client= new google.auth.OAuth2(
googleClintId,
googleSecretId,
"postmessage"
)
