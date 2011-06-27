<?php
include 'config.inc';
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