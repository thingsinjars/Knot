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

$data               = array();
$data['tables']     = 'knot_seeds';
$result = $db->select($data);

echo 'var patternSeeds = {';
echo "\n";
while($seed = $result->fetch(PDO::FETCH_ASSOC)) {
  echo "'" . $seed['knot_name'] . "':{";
  echo "'seed':'" . $seed['seed'] . "',";
  echo "'ninety': " . ($seed['ninety']?'true':'false') . ",";
  echo "'oneeighty': " . ($seed['oneeighty']?'true':'false') . ", ";
  echo "'flipvertical': " . ($seed['flipvertical']?'true':'false') . ", ";
  echo "'fliphorizontal': " . ($seed['fliphorizontal']?'true':'false') . "},";
echo "\n";
}
echo '};';