var isOpera = navigator.userAgent.indexOf( 'Opera' ) > -1;
var isIE = navigator.userAgent.indexOf( 'MSIE' ) > 1 && !isOpera;
var isMoz = navigator.userAgent.indexOf( 'Mozilla/5.' ) == 0 && !isOpera;

var xmlReq = null;
var load_form = null;

var ServerApp = 'ciyam_interface.fcgi';
var qsContext = window.location.search.substring( 1 ); //i.e. remove the ? prefix
var qsFurther = '';

var secureOnly = false;
var encryptPosts = true;
var source = window.location.href.split( ':' );
if( secureOnly && source[ 0 ] != 'https' )
   window.location.replace( 'https:' + source[ 1 ] );

var scrollTop = 0;
var scrollLeft = 0;

var loggedIn = false;
var jump_back = false;
var had_act_error = false;

var serverId = '';
var uniqueId = '';

var hashRounds = 10000;

var validation_error = '';

var displayTimeout = 'Timeout occurred.';
var displayInvalidDate = 'Invalid date.';
var displayInvalidTime = 'Invalid time.';
var displayIncorrectDateFormat = 'Incorrect date format.';
var displayIncorrectTimeFormat = 'Incorrect time format.';
var displayEnterRequiredValues = 'Enter required values.';
var displayIncorrectBytesFormat = 'Incorrect bytes format.';
var displaySelectOneOrMoreItems = 'Select one or more items to perform this operation on.';
var displayIncorrectIntegerFormat = 'Incorrect integer format.';
var displayIncorrectNumericFormat = 'Incorrect numeric format.';
var displayIncorrectDurationFormat = 'Incorrect duration format.';
var displayMaximumTextLimitReached = 'Maximum text limit reached.';
var displayYourSessionIsAboutToExpire = 'Your session is about to expire. Click OK to continue.';
var displaySelectedRecordsWillBeRemoved = 'Selected record(s) will be permanently removed. Click OK to confirm.';
var displayPasswordVerificationIncorrect = 'Password verification incorrect.';

var dataFieldList = '';

var autoCompleteValues = [ ];

var extra_fields = '';
var extra_values = '';

var warn_refresh_func = '';

var auto_refresh_seconds = 30;
var warn_refresh_default = 500;
var warn_refresh_seconds = warn_refresh_default;

var warn_refresh_timer_id = 0;

var load_content_seconds = 10;
var load_content_timer_id = 0;

function is_leap_year( year )
{
   return year % 4 == 0 && ( year % 100 != 0 || year % 400 == 0 );
}

function refresh( back )
{
   if( isIE )
      window.location = window.location;
   else
      window.location.replace( window.location );

   if( isMoz && back != false )
      history.go( -1 );
}

function replace_with_scroll_info( )
{
   if( qsContext.length > 0 )
      insert_scroll_info( );

   var new_href = '';
   new_href += window.location.href;

   if( qsContext.length > 0 )
   {
      var pos = new_href.indexOf( '?' );
      if( pos > 0 )
         new_href = new_href.substr( 0, pos + 1 );

      new_href += qsContext;
   }

   window.location.replace( new_href );
}

function auto_refresh( )
{
   if( auto_refresh_seconds == 1 )
      replace_with_scroll_info( );
   else if( auto_refresh_seconds > 0 )
   {
      auto_refresh_seconds -= 1;
      setTimeout( "auto_refresh( )", 1000 );
   }
}

function warn_refresh( )
{
   if( warn_refresh_seconds == 1 )
   {
      warn_refresh_seconds = 0;

      if( confirm( displayYourSessionIsAboutToExpire ) )
      {
         if( warn_refresh_func != '' )
            eval( warn_refresh_func );
         else
            replace_with_scroll_info( );
      }
   }
   else if( warn_refresh_seconds > 0 )
   {
      warn_refresh_seconds -= 1;
      warn_refresh_timer_id = setTimeout( "warn_refresh( )", 1000 );
   }
}

function determine_scroll_info( )
{
   if( typeof( window.pageYOffset ) == 'number' )
   {
      // Netscape compliant
      scrollTop = window.pageYOffset;
      scrollLeft = window.pageXOffset;
   }
   else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) )
   {
      // DOM compliant
      scrollTop = document.body.scrollTop;
      scrollLeft = document.body.scrollLeft;
   }
   else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) )
   {
      // IE6 standards compliant mode
      scrollTop = document.documentElement.scrollTop;
      scrollLeft = document.documentElement.scrollLeft;
   }
   else
   {
      scrollTop = 0;
      scrollLeft = 0;
   }
}

function insert_scroll_info( )
{
   var qvars = qsContext.split( '&' );

   qsContext = '';
   determine_scroll_info( );

   var sx = 'scrollx';
   var sy = 'scrolly';

   var foundx = false;
   var foundy = false;

   for( var i = 0; i < qvars.length; i++ )
   {
      if( qvars[ i ].length >= sx.length + 1
       && qvars[ i ].charAt( sx.length ) == '='
       && qvars[ i ].substring( 0, sx.length ) == sx )
      {
         foundx = true;
         qvars[ i ] = sx + '=' + scrollLeft;
      }

      if( qvars[ i ].length >= sy.length + 1
       && qvars[ i ].charAt( sy.length ) == '='
       && qvars[ i ].substring( 0, sy.length ) == sy )
      {
         foundy = true;
         qvars[ i ] = sy + '=' + scrollTop;
      }

      if( qsContext != '' )
         qsContext += '&';
      qsContext += qvars[ i ];
   }

   if( !foundx )
   {
      if( qsContext != '' )
         qsContext += '&';
      qsContext += 'scrollx=' + scrollLeft;
   }

   if( !foundy )
   {
      if( qsContext != '' )
         qsContext += '&';
      qsContext += 'scrolly=' + scrollTop;
   }
}

function utf8_encode( string )
{
   string = string.replace( /\r\n/g, "\n" );
   var utftext = "";
  
   for( var n = 0, k = string.length; n < k; n++ )
   {
      var c = string.charCodeAt( n );
  
      if( c < 128 )
         utftext += String.fromCharCode( c );
      else if( ( c > 127 ) && ( c < 2048 ) )
      {
         utftext += String.fromCharCode( ( c >> 6 ) | 192 );
         utftext += String.fromCharCode( ( c & 63 ) | 128 );
      }
      else
      {
         utftext += String.fromCharCode( ( c >> 12 ) | 224 );
         utftext += String.fromCharCode( ( ( c >> 6 ) & 63 ) | 128 );
         utftext += String.fromCharCode( ( c & 63 ) | 128 );
      }
   }

   return utftext;
}

function utf8_decode( utftext )
{
   var string = "";
   var i = 0;
   var c = c1 = c2 = 0;
  
   while ( i < utftext.length )
   {
      c = utftext.charCodeAt( i );
      if( c < 128 )
      {
         string += String.fromCharCode( c );
         i++;
      }
      else if( ( c > 191 ) && ( c < 224 ) )
      {
         c2 = utftext.charCodeAt( i + 1 );
         string += String.fromCharCode( ( ( c & 31 ) << 6 ) | ( c2 & 63 ) );
         i += 2;
      }
      else
      {
         c2 = utftext.charCodeAt( i + 1 );
         c3 = utftext.charCodeAt( i + 2 );
         string += String.fromCharCode( ( ( c & 15 ) << 12 ) | ( ( c2 & 63 ) << 6 ) | ( c3 & 63 ) ) ;
         i += 3;
      }
  
   }

   return string;
}

function string_to_bytes( str )
{
   var ch, st, re = [ ];
   for( var i = 0; i < str.length; i++ )
   {

      ch = str.charCodeAt( i )
      st = [ ];
      do
      {
         st.push( ch & 0xFF );
         ch = ch >> 8;
      } while( ch );

      re = re.concat( st.reverse( ) );
   }

   return re;
}

function load( )
{
   clearTimeout( warn_refresh_timer_id );

   // NOTE: This is necessary (at least for Firefox) to force a page
   // reload to occur when going back in history.
   window.onunload = function( ){ };

   if( typeof window.ActiveXObject != 'undefined' )
   {
      xmlReq = new ActiveXObject( 'Microsoft.XMLHTTP' );
      xmlReq.onreadystatechange = process;
   }
   else
   {
      xmlReq = new XMLHttpRequest( );
      xmlReq.onload = process;
   }

   var session_id = '';
   var has_session = false;
   var all_cookies = document.cookie.split( ';' );
   for( i = 0; i < all_cookies.length; i++ )
   {
      var next_cookie = all_cookies[ i ].split( '=' );
      if( next_cookie[ 0 ] == 'session' )
      {
         has_session = true;
         var cookie_parts = next_cookie[ 1 ].split( ',' );
         session_id = cookie_parts[ 0 ];
         break;
      }
   }

   if( !has_session )
   {
      session_id = 'new_session';
      document.cookie = 'session=new_session';
   }

   var qs_both = qsContext;
   var persistent = '';

   if( qs_both == '' )
      qs_both = qsFurther;
   else if( qsFurther != '' )
      qs_both += '&' + qsFurther;

   var is_login = false;
   var non_cookie = false;
   var qvars = qs_both.split( '&' );
   for( var i = 0; i < qvars.length; i++ )
   {
      var uname = 'username=';
      if( qvars[ i ].indexOf( uname ) == 0 )
      {
         is_login = true;
         document.cookie = 'user=' + qvars[ i ].substring( uname.length );
         localStorage.setItem( 'user', qvars[ i ].substring( uname.length ) );
      }

      var pname = 'persistent=true';
      if( qvars[ i ].indexOf( pname ) == 0 )
      {
         persistent = 'true';

         if( is_login )
            localStorage.setItem( 'fkey', sessionStorage.getItem( 'key' ) );
      }

      var sname = 'session=';
      if( qvars[ i ].indexOf( sname ) == 0 )
      {
         non_cookie = true;
         session_id = qvars[ i ].substring( sname.length );;
      }
   }

   var full_context = module;
   if( qsContext != '' )
   {
      if( full_context != '' )
         full_context += '&';
      full_context += qsContext;
   }

   var dummy = 'dummy=';
   var num_random = 10 + Math.floor( Math.random( ) * 6 );

   for( var i = 0; i < num_random; i++ )
      dummy += String.fromCharCode( 65 + Math.floor( Math.random( ) * 26 ) );

   full_context += '&' + dummy;

   if( qsFurther != '' )
   {
      if( full_context != '' )
         full_context += '&';
      full_context += qsFurther;
   }

   if( dataFieldList != '' )
   {
      if( full_context != '' )
         full_context += '&';
      full_context += 'fieldlist=' + dataFieldList;
   }

   if( full_context != '' )
      full_context += '&';
   full_context += 'suffix=';

   if( sessionStorage.getItem( 'key' ) == null && localStorage.getItem( 'fkey' ) != null )
      sessionStorage.setItem( 'key', localStorage.getItem( 'fkey' ) );

   xmlReq.open( 'POST', ServerApp, true );

   if( !encryptPosts || source[ 0 ] == 'https' )
      xmlReq.send( full_context );
   else
   {
      var post_data = '';
      var key = sessionStorage.getItem( 'key' );

      if( has_session && key != null && encryptPosts )
      {
         var prefix = 'prefix=';

         for( var i = 0; i < 22 - dummy.length; i++ )
            prefix += String.fromCharCode( 65 + Math.floor( Math.random( ) * 26 ) );

         full_context = prefix + '&' + full_context;

         while( full_context.length % 40 )
            full_context += String.fromCharCode( 65 + Math.floor( Math.random( ) * 26 ) );

         var full_key = '';
         full_key = sessionStorage.getItem( 'key' );
         var last_key = full_key;

         var all_bytes = string_to_bytes( full_context );

         while( full_key.length < all_bytes.length )
         {
            var next = hex_sha1( last_key );

            full_key += next;
            last_key = next;
         }

         var encrypted = '';

         // KLUDGE: The string is not encrypted in place as characters are UTF encoded
         // so the encrypted string is actually a hex string. It may be instead better
         // to use an array of bytes (which would require an extra base64 interface).
         for( var i = 0; i < all_bytes.length; i++ )
         {
            var val = ( full_key.charCodeAt( i ) ^ all_bytes[ i ] );

            var hex = '';
            if( val < 16 )
               hex += '0';
            hex += val.toString( 16 );

            encrypted += hex;
         }

         post_data = 'base64=' + Base64.encode( encrypted );

         if( is_login )
         {
            post_data += '&cmd=login&username=' + localStorage.getItem( 'user' )
            + '&persistent=' + persistent + '&' + module + '&session=' + session_id;
         }
         else if( non_cookie )
            post_data += '&' + module + '&session=' + session_id;
         else
            post_data += '&' + module;
      }
      else
         post_data = full_context;

      xmlReq.send( post_data );
   }

   if( load_form != null )
      disable_form( load_form );

   load_content_timer_id = setTimeout( load_timeout, load_content_seconds * 1000 );
}

function load_timeout( )
{
   xmlReq.abort( );

   if( load_form != null )
      enable_form( load_form );

   alert( displayTimeout );

   if( encryptPosts )
   {
      if( sessionStorage.getItem( 'key' ) != null )
         sessionStorage.setItem( 'key', hex_sha1( sessionStorage.getItem( 'key' ) ) );
   }
}

function fade_in( n )
{
   // NOTE: Currently only works for FF (under IE use blendTrans headers)
   // in order to try and make the page rendering look a little smoother.
   if( n <= 100 )
   {
      document.body.style.opacity = n / 100;
      n += 25;
      window.setTimeout( 'fade_in(' + n + ')', 10 );
   }
}

function process( )
{
   if( xmlReq.readyState != 4 )
      return;

   if( load_form != null )
      enable_form( load_form );

   clearTimeout( load_content_timer_id );

   document.body.style.opacity = 25;

   var response = xmlReq.responseText.substring( 2 );

   var base64test = /[^A-Za-z0-9\+\/\=]/g;
   base64test.exec( response ); // KLUDGE: Need to investigate javascript reg exps more to get rid of this.

   // NOTE: If there is no whitespace found in the response then it is assumed to be base64.
   if( base64test.exec( response ) )
      document.getElementById( 'content' ).innerHTML = response;
   else
   {
      response = Base64.decode( response );

      // NOTE: Now the encrypted hex string is decoded.
      var full_key = sessionStorage.getItem( 'key' );
      var last_key = full_key;

      while( full_key.length < response.length / 2 )
      {
         var next = hex_sha1( last_key );

         full_key += next;
         last_key = next;
      }

      var decrypted = '';
      for( i = 0; i < response.length; i += 2 )
      {
         var hex = response.charAt( i );
         hex += response.charAt( i + 1 );

         var val = parseInt( hex, 16 );
         val = val ^ full_key.charCodeAt( i / 2 );

         decrypted += String.fromCharCode( val );
      }

      document.getElementById( 'content' ).innerHTML = utf8_decode( decrypted );
   }

   if( document.getElementById( 'form_content_func' ) != null )
      eval( document.getElementById( 'form_content_func' ).value );

   if( document.getElementById( 'extra_content_func' ) != null )
      eval( document.getElementById( 'extra_content_func' ).value );

   if( encryptPosts )
   {
      if( !loggedIn )
         sessionStorage.removeItem( 'key' );
      else if( sessionStorage.getItem( 'key' ) != null )
         sessionStorage.setItem( 'key', hex_sha1( sessionStorage.getItem( 'key' ) ) );
   }

   if( uniqueId != '' )
      sessionStorage.setItem( 'uuid', uniqueId );

   if( jump_back && !had_act_error )
      history.back( );
   else
   {
      jump_back = false;

      fade_in( 0 );
      // KLUDGE: A delay is needed in order for the focussing to work correctly in IE.
      setTimeout( "focus_on_first_text( )", 50 );
   }
}

function dyn_load( f, extra, clearContext )
{
   if( f == null || validate( f ) )
   {
      if( clearContext )
        qsContext = ''

      if( extra.indexOf( 'username' ) != 0 )
         insert_scroll_info( );

      if( extra_fields != '' )
      {
         if( extra != '' )
            extra += '&';
         extra += 'extrafields=' + extra_fields;
         extra += '&extravalues=' + extra_values;
      }

      qsFurther = extra;

      load_form = f;
      load( );
      load_form = null;
   }

   return false;
}

function list_action( f, cls, act, lst, qvar, qval )
{
   if( verify_one_or_more_checked( f ) )
   {
      if( qvar != null )
         query_update( qvar, qval, true );

      return dyn_load( f, 'act=' + act + '&app='
       + get_all_checked_names( f ) + '&cls=' + cls + '&listarg=' + lst, false );
   }
   else
      return false;
}

function list_exec_action( f, cls, lst, exec, qvar1, qval1, qvar2, qval2, no_app )
{
   if( no_app || verify_one_or_more_checked( f ) )
   {
      if( qvar1 != null )
         query_update( qvar1, qval1, true );

      if( qvar2 != null )
         query_update( qvar2, qval2, true );

      if( no_app )
         return dyn_load( f, 'act=exec&cls=' + cls + '&exec=' + exec + '&listarg=' + lst, false );
      else
         return dyn_load( f, 'act=exec&app='
          + get_all_checked_names( f ) + '&cls=' + cls + '&exec=' + exec + '&listarg=' + lst, false );
   }
   else
      return false;
}

function query_value( qvar )
{
   var qval = '';
   var qvars = qsContext.split( '&' );

   for( var i = 0; i < qvars.length; i++ )
   {
      if( qvars[ i ].length >= qvar.length + 1
       && qvars[ i ].charAt( qvar.length ) == '='
       && qvars[ i ].substring( 0, qvar.length ) == qvar )
      {
         qval = qvars[ i ].substring( qvar.length + 1 );
         break;
      }
   }

   return qval;
}

function query_update( qvar, qval, keep_location )
{
   var found = false;
   var empty = ( qval == '' );
   var qvars = qsContext.split( '&' );

   qsContext = '';
   for( var i = 0; i < qvars.length; i++ )
   {
      var skip = false;

      if( qvars[ i ].length >= qvar.length + 1
       && qvars[ i ].charAt( qvar.length ) == '='
       && qvars[ i ].substring( 0, qvar.length ) == qvar )
      {
         if( empty )
            skip = true;
         else
            qvars[ i ] = qvar + '=' + encodeURIComponent( qval );

         found = true;
      }

      if( !skip )
      {
         if( qsContext != '' )
            qsContext += '&';
         qsContext += qvars[ i ];
      }
   }

   if( !found && !empty )
      qsContext += '&' + qvar + '=' + encodeURIComponent( qval );

   if( keep_location != true )
   {
      insert_scroll_info( );
      window.location.search = qsContext;
   }
}

function sel_new_loc( sel )
{
   if( sel.options[ sel.selectedIndex ].value != "" )
      location.href = sel.options[ sel.selectedIndex ].value;
}

function sel_qry_update( sel, qvar )
{
   query_update( qvar, sel.options[ sel.selectedIndex ].value );
}

function sel_list_action( f, cls, act, lst, sel, fld, qvar, qval )
{
   if( sel.selectedIndex > 0 )
   {
      if( !verify_one_or_more_checked( f ) )
         sel.selectedIndex = 0;
      else
      {
         if( qvar != null )
            query_update( qvar, qval, true );

         dyn_load( f, 'act=' + act + '&app=' + get_all_checked_names( f ) + '&cls=' + cls
          + '&extra=' + sel.options[ sel.selectedIndex ].value + '&field=' + fld + '&listarg=' + lst, false );
      }
   }
}

function remove_table_row_error( tbl, row )
{
   var is_error = false;

   var row_num = 0;
   var data_row_num = 0;
   for( row_num = 0; row_num < tbl.rows.length; row_num++ )
   {
      // NOTE: It would make sense to use a special attribute for the error status, however,
      // Opera (ver 8) seems to only be able to access to the 'class' attribute of a table row.
      if( tbl.rows[ row_num ].getAttribute( 'class' ) == 'error'
       || tbl.rows[ row_num ].getAttribute( 'class' ) == 'odd_error'
       || tbl.rows[ row_num ].getAttribute( 'className' ) == 'error'
       || tbl.rows[ row_num ].getAttribute( 'className' ) == 'odd_error' )
         is_error = true;
      else
         is_error = false;

      if( data_row_num > row )
         break;
      else if( !is_error )
         data_row_num++;
   }

   if( is_error )
      tbl.deleteRow( row_num );

   return true;
}

function remove_table_row_from_checkbox( cb )
{
   var list_id = cb.getAttribute( 'list_id' );
   var list_error = cb.getAttribute( 'list_error' );

   if( list_id != null && list_error != null )
      remove_table_row_error( document.getElementById( list_id ), list_error );
}

function prefill( v, n, c )
{
   var s = '';
   s += v;

   while( s.length < n )
      s = c + s;

   return s;
}

function utc_dtm( dt )
{
   var output = '';

   output += dt.getUTCFullYear( );
   output += '-' + prefill( dt.getUTCMonth( ) + 1, 2, '0' );
   output += '-' + prefill( dt.getUTCDate( ), 2, '0' );

   output += '_' + prefill( dt.getUTCHours( ), 2, '0' );
   output += ':' + prefill( dt.getUTCMinutes( ), 2, '0' );
   output += ':' + prefill( dt.getUTCSeconds( ), 2, '0' );

   return output;
}

function hash_value( s, n )
{
   for( var i = 0; i < n; i++ )
      s = hex_sha1( s ).toLowerCase( );

   return s;
}

function hash_password( pwd, skip_id )
{
   var retval = '';

   // NOTE: If the password length is >= 40 then it is being
   // assumed that it is already hashed (this will occur for
   // record editing where it has not been changed).
   if( pwd.length >= 40 )
      retval = pwd;
   else
      retval = hash_value( serverId + pwd, hashRounds ).toLowerCase( );

   if( sessionStorage.getItem( 'uuid' ) != null )
      uniqueId = sessionStorage.getItem( 'uuid' );

   if( skip_id != true && uniqueId != '' )
      retval += '@' + uniqueId;

   if( encryptPosts )
   {
      if( sessionStorage.getItem( 'key' ) == null )
         sessionStorage.setItem( 'key', hex_sha1( serverId + pwd ) );
   }

   return retval;
}

function escape_char( input, ch )
{
   var output = '';

   for( var i = 0; i < input.length; i++ )
   {
      var next = input.charAt( i );
      if( next == ch || next == '\\' )
         output += '\\';
      output += next;
   }

   return output;
}

function form_keys( event, enter, cancel )
{
   if( enter != null && event.keyCode == 13 )
   {
      enter.click( );
      return false;
   }
   else if( cancel != null && event.keyCode == 27 )
   {
      cancel.click( );
      return false;
   }

   return true;
}

function getY( elem )
{
   var y = 0;

   while( elem != null )
   {
      y += elem.offsetTop;
      elem = elem.offsetParent;
   }

   return y;
}

function scroll_page( x, y )
{
   scrollLeft = x;
   scrollTop = y;

   scrollTo( scrollLeft, scrollTop );
}

function focus_on_first_text( )
{
   var done = false;
   var first = true;

   for( var i = 0; i < document.forms.length; i++ )
   {
      var form = document.forms[ i ];

      if( form.disabled ) // NOTE: Non-standard but IE supports this.
         continue;

      for( var j = 0; j < form.elements.length; j++ )
      {
         // NOTE: If the control above the scroll top then don't consider it for focus.
         if( getY( form.elements[ j ] ) < scrollTop )
            continue;

         if( !form.elements[ j ].disabled && form.elements[ j ].getAttribute( 'nofocus' ) != 'true' )
         {
            if( first && ( form.elements[ j ].type == 'checkbox' || form.elements[ j ].type == 'select-one' ) )
            {
               first = false;
               form.elements[ j ].focus( );
            }

            if( form.elements[ j ].type == 'file'
             || form.elements[ j ].type == 'text'
             || form.elements[ j ].type == 'textarea'
             || form.elements[ j ].type == 'password' )
            {
               if( form.elements[ j ].type == 'text' )
                  form.elements[ j ].select( );

               form.elements[ j ].focus( );
               done = true;
               break;
            }
         }   
      }

      if( done )
         break;
   }
}

function limit_text( limit_field, limit_count, limit_num )
{
   if( limit_field.value.length > limit_num )
   {
      limit_field.value = limit_field.value.substring( 0, limit_num );
      alert( displayMaximumTextLimitReached );
   }
   else if( limit_count != null )
      document.getElementById( limit_count ).innerHTML = limit_num - limit_field.value.length;
}

function resize_text_rows( t, min, max )
{
   a = t.value.split( '\n' );
   b = 1;

   for( x = 0; x < a.length; x++ )
   {
      if( a[ x ].length >= t.cols )
         b += Math.floor( a[ x ].length / t.cols );
   }

   b += a.length;

   if( min != null && b < min )
      b = min;

   if( max != null && b > max )
      b = max;

   // KLUDGE: IE8 (and possibly IE7) end up with a half line (therefore scrollbars) unless this is done.
   if( isIE && b > 10 )
      b += 2;

   t.rows = b;
}

function textbox_select( oTextbox, iStart, iEnd )
{
   switch( arguments.length )
   {
      case 1:
      oTextbox.select( );
      break;

      case 2:
      iEnd = oTextbox.value.length;
      // i.e. fall through
            
      case 3:
      if( isIE )
      {
         var oRange = oTextbox.createTextRange( );
         oRange.moveStart( 'character', iStart );
         oRange.moveEnd( 'character', -oTextbox.value.length + iEnd );
         oRange.select( );
      }
      else if( isMoz || isOpera )
         oTextbox.setSelectionRange( iStart, iEnd );
   }

   oTextbox.focus( );
} 

function textbox_replace_select( oTextbox, sText )
{
   if( isIE )
   {
      var oRange = document.selection.createRange( );
      oRange.text = sText;
      oRange.collapse( true );
      oRange.select( );
   }
   else if( isMoz || isOpera )
   {
      var iStart = oTextbox.selectionStart;
      oTextbox.value = oTextbox.value.substring( 0, iStart )
       + sText + oTextbox.value.substring( oTextbox.selectionEnd, oTextbox.value.length );

      oTextbox.setSelectionRange( iStart + sText.length, iStart + sText.length );
   } 

   oTextbox.focus( );
} 

function autocomplete_match( sText, autoCompleteValues )
{
   for( var i = 0; i < autoCompleteValues.length; i++ )
   {
      if( autoCompleteValues[ i ].indexOf( sText ) == 0 )
         return autoCompleteValues[ i ];
   }

   return null; 
}

function autocomplete( oTextbox, oEvent, autoCompleteValues )
{
   switch( oEvent.keyCode )
   {
      case 13: //enter
      case 38: //up arrow
      case 40: //down arrow
      case 37: //left arrow
      case 39: //right arrow
      case 33: //page up
      case 34: //page down
      case 36: //home
      case 35: //end
      case 13: //enter
      case 9: //tab
      case 27: //esc
      case 16: //shift
      case 17: //ctrl
      case 18: //alt
      case 20: //caps lock
      case 8: //backspace
      case 46: //delete
      return true;

      default:
      textbox_replace_select( oTextbox, String.fromCharCode( isMoz ? oEvent.charCode : oEvent.keyCode ) );

      var iLen = oTextbox.value.length;
      var sMatch = autocomplete_match( oTextbox.value, autoCompleteValues );

      if( sMatch != null )
      {
         if( isOpera && sMatch.length == oTextbox.value.length )
         {
            oTextbox.value = sMatch.substring( 0, sMatch.length - 1 );
            return true;
         }

         oTextbox.value = sMatch;
         textbox_select( oTextbox, iLen, oTextbox.value.length );
      }

      return false;
   } 
}

function check_or_uncheck_all( form, checkbox )
{
   for( var i = 0; i < form.elements.length; i++ )
   {
      if( form.elements[ i ].name.indexOf( 'item' ) == 0 )
      {
         form.elements[ i ].checked = checkbox.checked;

         // NOTE: If unchecking all then need to remove any list row errors as well.
         if( !checkbox.checked )
         {
            var list_id = form.elements[ i ].getAttribute( 'list_id' );
            var list_error = form.elements[ i ].getAttribute( 'list_error' );

            // KLUDGE: For some reason Opera can find empty strings rather than nulls so check value isn't empty as well.
            if( list_id != null && list_id != '' && list_error != null && list_error != '' )
               remove_table_row_error( document.getElementById( list_id ), list_error );
         }
      }
   }

   return true;
}

function get_all_checked_names( form )
{
   var all_names = '';

   for( var i = 0; i < form.elements.length; i++ )
   {
      if( form.elements[ i ].name.indexOf( 'item' ) == 0 && form.elements[ i ].checked )
      {
         if( all_names != '' )
            all_names += ',';
         all_names += form.elements[ i ].name.substring( 5 );
      }
   }

   return all_names;
}

function get_field_value( name, value )
{
   if( document.getElementById( 'wysiwyg' + name ) != null )
      value = document.getElementById( 'wysiwyg' + name ).contentWindow.document.body.innerHTML;

   // KLUDGE: The "iframe" used by "openWYSIWYG" is returning this rather than nothing.
   if( value == '<P>&nbsp;</P>' )
      value = '';

   return value;
}

function get_all_field_values( form )
{
   var num = 0;
   var all_values = '';

   if( form != null )
   {
      for( var i = 0; i < form.elements.length; i++ )
      {
         if( form.elements[ i ].name.indexOf( 'field' ) == 0 )
         {
            var value = form.elements[ i ].value;

            if( form.elements[ i ].getAttribute( 'hash' ) == '1' )
               value = hash_password( value, true );

            if( num++ > 0 )
               all_values += ',';
            if( form.elements[ i ].type == 'checkbox' )
            {
               if( form.elements[ i ].checked )
                  all_values += '1';
               else
                  all_values += '0';
            }
            else
               all_values += escape_char( get_field_value( form.elements[ i ].name, value ), ',' );
         }
      }

      all_values = encodeURIComponent( all_values );
   }

   return all_values;
}

function get_all_search_values( form, leave_unencoded )
{
   var num = 0;
   var all_values = '';

   for( var i = 0; i < form.elements.length; i++ )
   {
      if( form.elements[ i ].name.indexOf( 'search_' ) == 0 )
      {
         var value = form.elements[ i ].value;

         if( value == '' )
            continue;

         if( value == ' ' )
            value = '';

         if( num++ > 0 )
            all_values += ',';
         all_values += form.elements[ i ].name.substring( 7 );
         all_values += '=' + escape_char( value, ',' );
      }
   }

   if( leave_unencoded != true )
      all_values = encodeURIComponent( all_values );

   return all_values;
}

function verify_one_or_more_checked( form )
{
   var okay = false;

   for( var i = 0; i < form.elements.length; i++ )
   {
      if( form.elements[ i ].checked )
      {
         okay = true;
         break;
      }
   }

   if( !okay )
      alert( displaySelectOneOrMoreItems );

   return okay;
}

function validate_element( e, is_first )
{
   var okay = true, validate;

   validate = e.getAttribute( 'validate' );

   if( validate != null )
   {
      var checks = validate.split( ';' );

      for( var i = 0; i < checks.length; i++ )
      {
         var cmd_and_args = checks[ i ].split( ':' );

         var cmd = cmd_and_args[ 0 ];
         var args = '';

         if( cmd_and_args.length > 1 )
            args = cmd_and_args[ 1 ];

         if( cmd == 'reqd' )
         {
            if( e.value == '' )
               okay = false;
         }
         else if( cmd == 'verify' )
         {
            var other = document.getElementById( args );
            if( is_first && e.value != other.value )
            {
               okay = false;
               is_first = false;

               if( other.getAttribute( 'nofocus' ) != 'true' )
                  other.focus( );

               if( other.getAttribute( 'class' ) != 'textinput' && other.getAttribute( 'className' ) != 'textinput' )
               {
                  other.setAttribute( 'class', other.getAttribute( 'class' ) + ' error' );
                  other.setAttribute( 'className', other.getAttribute( 'className' ) + ' error' );
               }
               else
               {
                  other.setAttribute( 'class', other.getAttribute( 'class' ) + ' texterror' );
                  other.setAttribute( 'className', other.getAttribute( 'className' ) + ' texterror' );
               }

               validation_error = displayPasswordVerificationIncorrect;
            }
         }
         else if( cmd == 'time' )
         {
            if( e.value != '' )
            {
               var components = e.value.split( ':' );

               okay = false;

               if( e.value.length == 5 && components.length == 2 )
               {
                  var hour = parseInt( components[ 0 ] );
                  var minute = parseInt( components[ 1 ] );

                  if( hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 )
                     okay = true;
                  else
                     validation_error = displayInvalidTime;
               }

               if( e.value.length == 8 && components.length == 3 )
               {
                  var hour = parseInt( components[ 0 ] );
                  var minute = parseInt( components[ 1 ] );
                  var second = parseInt( components[ 2 ] );

                  if( hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59 )
                     okay = true;
                  else
                     validation_error = displayInvalidTime;
               }

               if( !okay && validation_error == '' )
                  validation_error = displayIncorrectTimeFormat;
            }
         }
         else if( cmd == 'datetime' )
         {
            if( e.value != '' )
            {
               var components = e.value.split( ' ' );
               var date_value = components[ 0 ];

               var date_components = date_value.split( '-' );

               okay = false;

               if( date_value.length == 10 && date_components.length == 3 )
               {
                  var year = parseInt( date_components[ 0 ] );
                  // NOTE: The 'parseInt' function interprets a leading zero as meaning octal unless the base is explicitly provided.
                  var month = parseInt( date_components[ 1 ], 10 );
                  var day = parseInt( date_components[ 2 ], 10 );

                  if( year >= 1900 && year <= 2100 )
                  {
                     var max_day = 0;
                     switch( month )
                     {
                        case 1:
                        case 3:
                        case 5:
                        case 7:
                        case 8:
                        case 10:
                        case 12:
                        max_day = 31;
                        break;

                        case 2:
                        if( is_leap_year( year ) )
                           max_day = 29;
                        else
                           max_day = 28;
                        break;

                        case 4:
                        case 6:
                        case 9:
                        case 11:
                        max_day = 30;
                     }

                     if( day >= 1 && day <= max_day )
                        okay = true;
                     else
                        validation_error = displayInvalidDate;
                  }
               }

               if( !okay && validation_error == '' )
                  validation_error = displayIncorrectDateFormat;

               if( okay && components.length > 1 )
               {
                  var time_value = components[ 1 ];
                  var time_components = time_value.split( ':' );

                  okay = false;

                  if( time_value.length == 5 && time_components.length == 2 )
                  {
                     var hour = parseInt( time_components[ 0 ] );
                     var minute = parseInt( time_components[ 1 ] );

                     if( hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 )
                        okay = true;
                     else
                        validation_error = displayInvalidTime;
                  }

                  if( time_value.length == 8 && time_components.length == 3 )
                  {
                     var hour = parseInt( time_components[ 0 ] );
                     var minute = parseInt( time_components[ 1 ] );
                     var second = parseInt( time_components[ 2 ] );

                     if( hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 && second >= 0 && second <= 59 )
                        okay = true;
                     else
                        validation_error = displayInvalidTime;
                  }

                  if( !okay && validation_error == '' )
                     validation_error = displayIncorrectTimeFormat;
               }
            }
         }
         else if( cmd == 'int' )
         {
            if( e.value != '' )
            {
               for( var j = 0; j < e.value.length; j++ )
               {
                  if( j == 0 && ( e.value.charAt( j ) == '+' || e.value.charAt( j ) == '-' ) )
                     continue;

                  if( e.value.charAt( j ) < '0' || e.value.charAt( j ) > '9' )
                  {
                     okay = false;
                     break;
                  }
               }

               if( !okay && validation_error == '' )
                  validation_error = displayIncorrectIntegerFormat;
            }
         }
         else if( cmd == 'numeric' )
         {
            if( e.value != '' )
            {
               var had_decimal = false;

               for( var j = 0; j < e.value.length; j++ )
               {
                  if( j == 0 && ( e.value.charAt( j ) == '+' || e.value.charAt( j ) == '-' ) )
                     continue;

                  if( e.value.charAt( j ) < '0' || e.value.charAt( j ) > '9' )
                  {
                     if( !had_decimal && e.value.charAt( j ) == '.' )
                        had_decimal = true;
                     else
                     {
                        okay = false;
                        break;
                     }
                  }
               }

               if( !okay && validation_error == '' )
                  validation_error = displayIncorrectNumericFormat;
            }
         }
         else if( cmd == 'bytes' )
         {
            if( e.value == '' )
               okay = false;
            else
            {
               var found_token = false;
               for( var j = 0; j < e.value.length; j++ )
               {
                  if( e.value.charAt( j ) < '0' || e.value.charAt( j ) > '9' )
                  {
                     if( e.value.charAt( j ) == 'b' || e.value.charAt( j ) == 'B'
                      || e.value.charAt( j ) == 'k' || e.value.charAt( j ) == 'K'
                      || e.value.charAt( j ) == 'm' || e.value.charAt( j ) == 'M'
                      || e.value.charAt( j ) == 'g' || e.value.charAt( j ) == 'G'
                      || e.value.charAt( j ) == 't' || e.value.charAt( j ) == 'T' )
                     {
                        if( found_token )
                        {
                           okay = false;
                           break;
                        }

                        found_token = true;
                     }
                     else
                     {
                        okay = false;
                        break;
                     }
                  }
               }
            }

            if( !okay && validation_error == '' )
               validation_error = displayIncorrectBytesFormat;
         }
         else if( cmd == 'duration_dhm' || cmd == 'duration_hms' )
         {
            var had_days = false;
            var had_hours = false;
            var had_minutes = false;
            var had_seconds = false;

            var parts = e.value.split( ' ' );
            for( var j = 0; j < parts.length; j++ )
            {
               var next_part = parts[ j ];
               for( var k = 0; k < next_part.length; k++ )
               {
                  if( next_part[ k ] < '0' || next_part[ k ] > '9' )
                  {
                     if( k != next_part.length - 1 )
                     {
                        okay = false;
                        break;
                     }

                     if( cmd == 'duration_dhm' && next_part[ k ] == 'd' )
                     {
                        if( had_days || had_hours || had_minutes || had_seconds )
                        {
                           okay = false;
                           break;
                        }

                        had_days = true;
                     }
                     else if( next_part[ k ] == 'h' )
                     {
                        if( had_hours || had_minutes || had_seconds )
                        {
                           okay = false;
                           break;
                        }

                        had_hours = true;
                     }
                     else if( next_part[ k ] == 'm' )
                     {
                        if( had_minutes || had_seconds )
                        {
                           okay = false;
                           break;
                        }

                        had_minutes = true;
                     }
                     else if( cmd == 'duration_hms' && next_part[ k ] == 's' )
                     {
                        if( had_seconds )
                        {
                           okay = false;
                           break;
                        }

                        had_seconds = true;
                     }
                     else
                     {
                        okay = false;
                        break;
                     }
                  }
               }

               if( !okay )
                  break;
            }

            if( !had_days && !had_hours && !had_minutes && !had_seconds )
               okay = false;

            if( !okay && validation_error == '' )
               validation_error = displayIncorrectDurationFormat;
         }

         if( !okay )
         {
            if( is_first && e.getAttribute( 'nofocus' ) != 'true' )
               e.focus( );

            if( e.getAttribute( 'class' ) != 'textinput' && e.getAttribute( 'className' ) != 'textinput' )
            {
               e.setAttribute( 'class', e.getAttribute( 'class' ) + ' error' );
               e.setAttribute( 'className', e.getAttribute( 'className' ) + ' error' );
            }
            else
            {
               e.setAttribute( 'class', e.getAttribute( 'class' ) + ' texterror' );
               e.setAttribute( 'className', e.getAttribute( 'className' ) + ' texterror' );
            }
         }
      }
   }

   return okay;
}

function validate( frm )
{ 
   var okay = true, elements, i, e;

   validation_error = '';

   if( document.getElementsByTagName )
   {
      elements = frm.getElementsByTagName( 'input' );
      for( var i = 0, e; e = elements.item( i++ ); )
      {
         if( e.getAttribute( 'type' ) == 'text'
          || e.getAttribute( 'type' ) == 'password' )
         {
            if( !validate_element( e, okay ) )
               okay = false;
         }
      }
   }

   if( !okay )
   {
      if( validation_error != '' )
         alert( validation_error );
      else
         alert( displayEnterRequiredValues );
   }

   return okay;
}

function confirm_delete( frm )
{ 
   for( var i = 0; i < frm.length; i++ )
   {
      if( frm.elements[ i ].name.indexOf( 'item' ) == 0 )
      {
         if( frm.elements[ i ].checked )
            return confirm( displaySelectedRecordsWillBeRemoved );
      }
   }

   return false;
}

function disable_form( f )
{
   f.style.cursor = 'wait';
   if( f.elements )
   {
      for( i = 0; i < f.elements.length; i++ )
      {
         f.elements[ i ].was_disabled = f.elements[ i ].disabled;
         f.elements[ i ].disabled = true;
      }
   }
}

function enable_form( f )
{
   f.style.cursor = 'default';
   if( f.elements )
   {
      for( i = 0; i < f.elements.length; i++ )
      {
         if( !f.elements[ i ].was_disabled )
            f.elements[ i ].disabled = false;
         f.elements[ i ].was_disabled = false;
      }
   }
}

