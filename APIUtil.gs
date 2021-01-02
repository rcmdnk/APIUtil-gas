class APIUtil {
  constructor(name='MyService', base_url=undefined, token_url=undefined,
              client_id=undefined, client_secret=undefined, scope=undefined, params=undefined, 
              token=undefined, url=undefined) {
    this.name = name;
    this.params = {base_url: base_url, token_url: token_url, client_id: client_id, client_secret: client_secret}
    this.scope = scope;
    this.params = params;
    this.token = token;
    this.url = url;
  }
  
  get base_url() { return this.params.base_url; }
  get token_url() { return this.params.token_url; }
  get client_id() { return this.params.client_id; }
  get client_secret() { return this.params.client_secret; }
  set base_url(base_url) { this.params.base_url = base_url; }
  set token_url(token_url) { this.params.token_url = token_url; }
  set client_id(base_url) { this.params.client_id = client_id; }
  set client_secret(client_secret) { this.params.client_secret = client_secret; }
  
  get service() {
    this.params.forEach(function(key){
      if(!this[key])throw new Error('Set ' + key);
    });
　  let service = OAuth2.createService(this.name)
 　     .setAuthorizationBaseUrl(this.params.base_url)
 　     .setTokenUrl(this.params.token_url)  
  　    .setClientId(this.params.client_id)
 　     .setClientSecret(this.params.client_secret)
  　    .setCallbackFunction('authCallback')
  　    .setPropertyStore(PropertiesService.getUserProperties())
    if(this.scope) service = service.setScope(this.scope);
    if(this.params){
 　    Object.keys(this.params).forEach(function(key){
 　      service = service.setParam(key, this[key]);
      });
    }
    return service;
  }
  
  get token() {
    if(this.token)return this.token;
    const service = this.service;
    if (!service.hasAccess()) {
      throw new Error('Open the following URL and re-run the script: '
                      + service.getAuthorizationUrl());
    }
    return service.getAccessToken();
  }

  reset() {
    this.getService().reset();
　}

  authCallback(request) {
    const service = this.getService();
    const authorized = service.handleCallback(request);
    if (authorized) {
      return HtmlService.createHtmlOutput('Success!');
    } else {
      return HtmlService.createHtmlOutput('Denied.');
    }
  }

  logRedirectUri() {
    Logger.log(OAuth2.getRedirectUri());
  }
  
  fetch (url=undefined) {
    url = url || this.url;
    return UrlFetchApp.fetch(url, {
      headers: {
        Authorization: 'Bearer ' + this.token
      }
    });                                       
  }
  
  contentText (url=undefined) {
    return this.fetch(url).getContentText();
  }
  
  json (url=undefined) {
    return JSON.parse(this.contentText(url));
  }                 
}

function getUtil() {
  const name = (typeof OAUTH2_NAME === 'undefined') ? undefined : OAUTH2_NAME;
  const base_url = (typeof OAUTH2_BASE_URL === 'undefined') ? undefined : OAUTH2_BASE_URL;
  const token_url = (typeof OAUTH2_TOKEN_URL === 'undefined') ? undefined : OAUTH2_TOKEN_URL;
  const client_id = (typeof OAUTH2_CLIENT_ID === 'undefined') ? undefined : OAUTH2_CLIENT_ID;
  const client_secret = (typeof OAUTH2_CLIENT_SECRET === 'undefined') ? undefined : OAUTH2_CLIENT_SECRET
  const token = (typeof OAUTH2_TOKEN === 'undefined') ? undefined : OAUTH2_TOKEN;
  const scope = (typeof OAUTH2_SCOPE === 'undefined') ? undefined : OAUTH2_SCOPE;
  const params = (typeof OAUTH2_PARAMS === 'undefined') ? undefined : OAUTH2_PARAMS;
  const url = (typeof OAUTH2_URL === 'undefined') ? undefined : OAUTH2_URL;
  return APIUtil(name, base_url, token_url, client_id, client_secret, scope, params, token, url);
}