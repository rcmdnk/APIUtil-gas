class APIUtil {
  constructor(name='MyService', base_url=undefined, token_url=undefined,
              client_id=undefined, client_secret=undefined, scope=undefined, params={},
              token=undefined, url=undefined, headers={}) {
    this.name = name;
    this.vars = {base_url: base_url, token_url: token_url, client_id: client_id, client_secret: client_secret}
    this.scope = scope;
    this.params = params;
    this.token = token;
    this.url = url;
    this.headers=headers;
  }
  
  get base_url() { return this.vars.base_url; }
  get token_url() { return this.vars.token_url; }
  get client_id() { return this.vars.client_id; }
  get client_secret() { return this.vars.client_secret; }
  set base_url(base_url) { this.vars.base_url = base_url; }
  set token_url(token_url) { this.vars.token_url = token_url; }
  set client_id(client_id) { this.vars.client_id = client_id; }
  set client_secret(client_secret) { this.vars.client_secret = client_secret; }
  
  get service() { 
    const vars = this.vars;
    Object.keys(vars).forEach(function(key){
      if(!vars[key])throw new Error('Set ' + key);
    });
　  let service = OAuth2.createService(this.name)
 　     .setAuthorizationBaseUrl(this.vars.base_url)
 　     .setTokenUrl(this.vars.token_url)  
  　    .setClientId(this.vars.client_id)
 　     .setClientSecret(this.vars.client_secret)
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
  
  getToken() {
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
    let headers = this.headers;
    headers['Authorization'] = 'Bearer ' + this.getToken();
    return UrlFetchApp.fetch(url, {
      headers: headers
    });                                       
  }
  
  contentText (url=undefined) {
    return this.fetch(url).getContentText();
  }
  
  json (url=undefined) {
    return JSON.parse(this.contentText(url));
  }                 
}

function getUtil(name='MyService', base_url=undefined, token_url=undefined,
                 client_id=undefined, client_secret=undefined, scope=undefined, params={},
                 token=undefined, url=undefined, headers={}){
  return new APIUtil(name, base_url, token_url, client_id, client_secret, scope, params, token, url, headers);
}