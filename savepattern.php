<?php
$config = array();
$config['user'] = 'xXxXxXxXxXx';
$config['pass'] = 'xXxXxXxXxXx';
$config['name'] = 'zombie_apps';
$config['host'] = 'xXxXxXxXxXx.xXxXxXxXxXx.com';
$config['type'] = 'mysql';
$config['port'] = 3306;
$config['persistent'] = true;
include 'cxpdo.php';
$db = db::instance($config);


$code = $_POST['shapecode'];
$name = $_POST['shapename'];

$matches=array();
preg_match('/[0-9]{9}/', $code, $matches);
if(count($matches)) {
  preg_match('/[0-9a-z\t]/i', $name, $matches);
  if(count($matches)) {
    $data                   = array();
    $data['knot_name']      = $name;
    $data['seed']           = $code;
    $data['ninety']         = $_POST['ninety']=='yes'?'1':'0';
    $data['oneeighty']      = $_POST['oneeighty']=='yes'?'1':'0';
    $data['flipvertical']   = $_POST['flipvertical']=='yes'?'1':'0';
    $data['fliphorizontal'] = $_POST['fliphorizontal']=='yes'?'1':'0';
    $data['approved']       = 1;
    $result = $db->insert('knot_seeds', $data);
    echo "<p>That pattern has been added.</p>";

  } else {
    echo '<p>Please only use letters, numbers and spaces.</p>';
  }
} else {
  echo '<p>Some kind of weird, malformed pattern code happened there.</p>';
}