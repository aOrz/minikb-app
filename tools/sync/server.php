<?php
if ($_GET['token'] != '1') {
    echo 'ok';
    exit();
}
if($_GET[url]) {
readfile($_GET[url]);
    exit();
}

$type = '';
function curl_get_file_size( $url ) {
  // Assume failure.
  $result = -1;

  $curl = curl_init( $url );

  // Issue a HEAD request and follow any redirects.
  curl_setopt( $curl, CURLOPT_NOBODY, true );
  curl_setopt( $curl, CURLOPT_HEADER, true );
  curl_setopt( $curl, CURLOPT_RETURNTRANSFER, true );
  curl_setopt( $curl, CURLOPT_FOLLOWLOCATION, true );

  $data = curl_exec( $curl );
  curl_close( $curl );

  if( $data ) {
    $content_length = "unknown";
    $status = "unknown";

    if( preg_match( "/^HTTP\/1\.[01] (\d\d\d)/", $data, $matches ) ) {
      $status = (int)$matches[1];
    }

    if( preg_match( "/Content-Length: (\d+)/", $data, $matches ) ) {
      $content_length = (int)$matches[1];
    }
    
    $regex = '/ETag:\sW\/\"([^"]*)/'; 
    preg_match($regex, $data, $etags);
    if($etags[1] == $_GET['etag']) {
        echo 'no';
        exit();
    }
    $regex = '/application\/([^\s]*)/';   
    preg_match($regex, $data, $types);
    $type = $types[1];
    // http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
    if( $status == 200 || ($status > 300 && $status <= 308) ) {
      $result = $content_length;
    }
  }

  return array($type,  $content_length, $etags[1], $data);
}
$file_size = curl_get_file_size( "http://xk.jwc.ytu.edu.cn/bjkb.rar" );

$file = 'http://xk.jwc.ytu.edu.cn/bjkb.rar';
if ($_GET['durl']) {
    $file = $_GET['durl'];
}
 $info = pathinfo($file);
 $filename = $info['basename'];

    $info = curl_get_file_size($file); // The way to avoid corrupted ZIP
    $size = $info[1];
    $type = $info[0];
    // echo var_dump($info);
    header('Content-Type: '.$type);
    header('Content-Disposition: attachment; filename=' . $filename);
    header('Content-Length: ' . $size);
    // Clean before! In order to avoid 500 error
    ob_end_clean();
    flush();
    readfile($file);
exit(); // Or not, depending on what you need
?>