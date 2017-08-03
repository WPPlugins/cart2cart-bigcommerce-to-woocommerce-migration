jQuery(document).ready(function($) {

  var HTTP_PATH                 = 'https://app.shopping-cart-migration.com/';
  var HTTP_API_PATH             = HTTP_PATH + 'capi/';
  var SELF_PATH                 = 'plugins.php?page=cart2cart-config&c2caction=';

  var messages                  = $('#messages');
  var loggedEmail               = $('#loggedEmail');

  var loginCart2cartAccount     = $("#loginCart2cartAccount");
  var loginCart2cartPass        = $("#loginCart2cartPass");
  var cart2CartLoginKey         = $("#cart2CartLoginKey");
  var cart2CartLoginEmail       = $("#cart2CartLoginEmail");
  var submitLoginForm           = $("#submitLoginForm");

  var registerCart2cartName     = $("#registerCart2cartName");
  var registerCart2cartAccount  = $("#registerCart2cartAccount");
  var registerCart2cartPass     = $("#registerCart2cartPass");
  var registerRefererText       = $("#registerRefererText");
  var submitRegisterForm        = $("#submitRegisterForm");


  var Cart2cartSourceUrl        = $("#Cart2cartSourceUrl");
  var Cart2cartApiPass          = $("#Cart2cartApiPass");
  var Cart2cartSourceCartId     = $("#Cart2cartSourceCartId");
  var Cart2cartTargetCartId     = $("#Cart2cartTargetCartId");
  var Cart2cartApiAccount       = $("#Cart2cartApiAccount");
  var Cart2cartApiPath          = $("#Cart2cartApiPath");
  var sourceCartSetup           = $(".sourceCartSetup");
  var secondStep                = $("#secondStep");

  var showButton                = $("#showButton");
  var Cart2cartConnectionInstall    = $("#Cart2cartConnectionInstall");
  var Cart2cartConnectionUninstall  = $("#Cart2cartConnectionUninstall");

  var storeToken                = $("#storeToken");
  var isLogged                  = $("#isLogged");

  var logout                    = $(".logout");

  var is_source_valid           = false;

  logout.on("click",function(){
    logoff();
  });

  if (showButton.val() == 'install'){
    Cart2cartConnectionUninstall.hide();
    Cart2cartConnectionInstall.show();
  }else{
    Cart2cartConnectionInstall.hide();
    Cart2cartConnectionUninstall.show();
  }

  function getParameter(paramName) {
    var searchString = window.location.search.substring(1),	i, val, params = searchString.split("&");
    for (i=0;i<params.length;i++) {
      val = params[i].split("=");
      if (val[0] == paramName) {
        return unescape(val[1]);
      }
    }
    return null;
  }

  function errorMessage(message,type){
    var messageText = new Array();
    console.log(type);
    if (type == 'error'){
      messages.removeClass("successMessage");
      messages.addClass("errorMessage");
    }
    if (type == 'success'){
      messages.removeClass("errorMessage");
      messages.addClass("successMessage");
    }
    messages.text(message);
    messages.show();
    setTimeout(function () {
      messages.hide();
    }, 5000);
  }

  function login(email,pass){
    var encPass = hex_md5(email.toLowerCase()+pass);
    $.ajax({
      cache: false,
      url: HTTP_API_PATH+"login",
      dataType: "jsonp",
      jsonpCallback: "callback",
      data: {"email" : email, "pass" : encPass},
      success: function(data){
        if (data.error == false){
          errorMessage(data.data,'success');
          saveLoginStatus('Yes',email,encPass)

        } else {
          errorMessage(data.data,'error');
        }
      }
    });
  }

  function logoff(){
    $.ajax({
      cache: false,
      url: HTTP_API_PATH+"logout",
      dataType: "jsonp",
      jsonpCallback: "callback",
      success: function(){
        saveLoginStatus('No','','');

      }
    });
  }

  function register(name,email,pass, referer){
    $.ajax({
      cache: false,
      url: HTTP_API_PATH+"register",
      dataType: "jsonp",
      jsonpCallback: "callback",
      data: {"email" : email, "pass" : pass, "fullname" : name, "referer" : referer},
      success: function(data){
        if (data.error == false){
          errorMessage('Register success','success');
          console.log("register success, try to login");
          login(email,pass);
        } else {
          errorMessage(data.data,'error');
        }
      }
    });
  }

  function saveLoginStatus(status,email,encPass){
    $.ajax({
      cache: false,
      url: SELF_PATH+"saveLoginStatus&status="+status+"&email="+encodeURIComponent(email)+'&encPass='+encPass,
      success:function(){
        window.location.reload();
      }
    });
  }

  function getToken(){
    var email =cart2CartLoginEmail.val();
    var key = window.btoa(cart2CartLoginKey.val());

    $.ajax({
      cache: false,
      url: HTTP_API_PATH+"get-token",
      dataType: "jsonp",
      jsonpCallback: "callback",
      data: {"email" : email, "key" : key},
      success: function(data){
        if (data.error == false){
          saveToken(data.data.token);
        } else {
          errorMessage(data.data,'error');
        }
      }
    });
  }

  function saveToken(token){
    console.log('try to save token '+ token);
    $.ajax({
      url: SELF_PATH + "saveToken&c2c_token="+token,
      success: function(){
        console.log('token '+ token + ' saved');
        storeToken.val(token);
        sendBridgeRequest("install");
      }
    });
  }

  function sendBridgeRequest(install){
    console.log("try to "+install+"-bridge");
    $.ajax({
      cache: false,
      url: SELF_PATH + install+'Bridge',
      success: function(){
        if (install == 'install'){
          showButton.val('uninstall');
          Cart2cartConnectionInstall.hide();
          Cart2cartConnectionUninstall.show();
          errorMessage('Connection Bridge installed','success');
        }else{
          showButton.val('install');
          Cart2cartConnectionUninstall.hide();
          Cart2cartConnectionInstall.show();
          errorMessage('Connection Bridge uninstalled','success');
        }
        $("#bridgeajaxloader").hide();
        console.log(install+"-bridge");
      }
    });
  }

  function checkApi(url,apiPass,apiAccount, apiPath){
    $("#ajaxloader").show();
    result = $.ajax({
      cache: false,
      async: false,
      url: SELF_PATH + "checkApi&url="+encodeURIComponent(url)
        +"&apipass="+apiPass+"&apiaccount="+apiAccount+"&apipath="+encodeURIComponent(apiPath)
    });
    var res;
    result.always(function() {
      $("#ajaxloader").hide();
      var data = jQuery.parseJSON(result.responseText);
      if (data.messageType == 'error'){
        errorMessage(data.messages,data.messageType);
        res = false;
      } else {
        res = true;
      }
    });
    return res;
  }

  function createMigration()
  {
    reg = /(.*)\/[^\/]+\/[^\/]+/;
    res = reg.exec(window.location.href)
    $.ajax({
      cache: false,
      dataType: 'jsonp',
      jsonpCallback: 'callbackCreate',
      url: HTTP_API_PATH + 'create-migration',
      data: {
        'email': loggedEmail.text(),
        'pass': cart2CartLoginKey.val(),
        'sourceCartId': Cart2cartSourceCartId.val(),
        'sourceUrl': Cart2cartSourceUrl.val(),
        'sourceVariables': {
          'apiPath'       :Cart2cartApiPath.val(),
          'adminAccount'  :Cart2cartApiAccount.val(),
          'apiKey'        :Cart2cartApiPass.val()
        },
        'targetCartId': Cart2cartTargetCartId.val(),
        'targetUrl': res[1],
        'targetVariables': '',
        "modulename" : Cart2cartTargetCartId.val()
      },
      success: function(data){
        if (data.error == true){
          errorMessage(data.data, 'error');
        } else {
          $('#startMigration').attr('onClick',
            "javascript: window.open('" + HTTP_PATH + "from-"
              +Cart2cartSourceCartId.val().toLowerCase()+"-to-"+Cart2cartTargetCartId.val().toLowerCase()
              +"/migrations/wizard2/edit/id/"+data.data.id+"','_blank');return false;");
        }
        $("#ajaxloader").hide();
      }
    });
  }

  sourceCartSetup.on("click",function(e){
    var hasError = false;
    $(".c2cReqired").hide();
    Cart2cartSourceUrl.removeClass('c2cReqiredField');
    Cart2cartApiPass.removeClass('c2cReqiredField');
    Cart2cartApiAccount.removeClass('c2cReqiredField');
    Cart2cartApiPath.removeClass('c2cReqiredField');
    if (Cart2cartSourceUrl.val() == ''){
      Cart2cartSourceUrl.addClass('c2cReqiredField');
      $("#hostError").html('Store URL is required');
      $("#hostError").animate({
        'opacity': 'show'
      });
      hasError = true;
    }
    if (Cart2cartApiPass.val() == ''){
      Cart2cartApiPass.addClass('c2cReqiredField');
      $("#apiPass").html('Store API token is required');
      $("#apiPass").animate({
        'opacity': 'show'
      });
      hasError = true;
    }
    if (Cart2cartApiAccount.val() == ''){
      Cart2cartApiAccount.addClass('c2cReqiredField');
      $("#apiAccount").html('Store API account is required');
      $("#apiAccount").animate({
        'opacity': 'show'
      });
      hasError = true;
    }
    if (Cart2cartApiPath.val() == ''){
      Cart2cartApiPath.addClass('c2cReqiredField');
      $("#apiPath").html('Store API Path is required');
      $("#apiPath").animate({
        'opacity': 'show'
      });
      hasError = true;
    }
    if (!hasError && !checkApi(Cart2cartSourceUrl.val(), Cart2cartApiPass.val(),
      Cart2cartApiAccount.val(), Cart2cartApiPath.val())){
      Cart2cartSourceUrl.html('Url or token is incorrect');
      Cart2cartSourceUrl.animate({
        'opacity': 'show'
      });
      hasError = true;
    }
    if (!hasError){
      is_source_valid = true;
      $(".c2cReqired").hide();
      $("#ajaxloader").show();
    } else {
      is_source_valid = false;
      sourceCartSetup.removeClass('selected');
      return false;
    }
  });

  submitLoginForm.on("click",function(){
    var hasError = false;
    $(".c2cReqired").hide();

    loginCart2cartAccount.removeClass('c2cReqiredField');
    loginCart2cartPass.removeClass('c2cReqiredField');
    if (loginCart2cartAccount.val() == ''){
      loginCart2cartAccount.addClass('c2cReqiredField');
      $("#cart2cartAccount").html('Email is required');
      $("#cart2cartAccount").animate({
        'opacity': 'show'
      });
      hasError = true;
    }
    if (loginCart2cartPass.val() == ''){
      loginCart2cartPass.addClass('c2cReqiredField');
      $("#cart2cartPass").html('Password is required');
      $("#cart2cartPass").animate({
        'opacity': 'show'
      });
      hasError = true;
    }
    if (!hasError){
      $(".c2cReqired").hide();
      login(
        loginCart2cartAccount.val(),
        loginCart2cartPass.val()
      );
    }
  });

  submitRegisterForm.on("click",function(){
    var hasError = false;
    $(".c2cReqired").hide();

    registerCart2cartName.removeClass('c2cReqiredField');
    registerCart2cartAccount.removeClass('c2cReqiredField');
    registerCart2cartPass.removeClass('c2cReqiredField');
    if (registerCart2cartName.val()== ''){
      registerCart2cartName.addClass('c2cReqiredField');
      $("#registerAccountError").html('Name is required');
      $("#registerAccountError").animate({
        'opacity': 'show'
      });
      hasError = true;
    }

    if (registerCart2cartAccount.val()== ''){
      registerCart2cartAccount.addClass('c2cReqiredField');
      $("#registerEmailError").html('Email is required');
      $("#registerEmailError").animate({
        'opacity': 'show'
      });
      hasError = true;
    }
    if (registerCart2cartAccount.val().match(/[\._a-zA-Z0-9-]+@[\._a-zA-Z0-9-]+\.[A-z]{2,3}/igm) == null){
      registerCart2cartAccount.addClass('c2cReqiredField');
      $("#registerEmailError").html('Please use valid email address');
      $("#registerEmailError").animate({
        'opacity': 'show'
      });
      hasError = true;
    }

    if (registerCart2cartPass.val().length < 6){
      registerCart2cartPass.addClass('c2cReqiredField');
      $("#registerPassError").html('Password must be greater than 5 symbols');
      $("#registerPassError").animate({
        'opacity': 'show'
      });
      hasError = true;
    }
    if (!hasError){
      $(".c2cReqired").hide();
      register(
        registerCart2cartName.val(),
        registerCart2cartAccount.val(),
        registerCart2cartPass.val(),
        registerRefererText.val()
      );
    }

  });

  secondStep.on("click", function(){
    createMigration();
  });

  Cart2cartConnectionInstall.on("click",function(){
    $("#bridgeajaxloader").show();
    getToken();
  })
  Cart2cartConnectionUninstall.on("click",function(){
    if (confirm("Are you sure? You won't be able to migrate your data!")) {
      $("#bridgeajaxloader").show();
      sendBridgeRequest("remove");
    }
  })

  $(function (){
    var tabContainers = $('div.tabs_content > div');
    var tabNavigation = $('div.tabs_content ul.nav_tabs a, div.tabs_content div a');
    tabContainers.hide().filter(':first').show();
    tabNavigation.click(function () {
      if (!is_source_valid && isLogged.val().toLowerCase() != 'no') {
        return false;
      }
      tabContainers.hide();
      tabContainers.filter(this.hash).show();
      tabNavigation.removeClass('selected');
      $('a[href='+this.hash+']').each(function(){
        $(this).addClass('selected');
      });
      location.hash = this.hash;
      return false;
    });

    var hash = window.location.hash;
    var elements = $('a[href="' + hash + '"]');
    if (elements.length !== 0) {
      elements.click();
    }
  });

})