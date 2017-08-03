<?php
defined('ABSPATH') or die("Cannot access pages directly.");
class Cart2CartWorker{

  const API_PATH_FOR_BRIDGE = 'https://app.shopping-cart-migration.com/api.bridge.download/';

  var $root ='';
  var $c2cBridgePath ='';
  var $errorMessage = '';

  public function __construct(){
    $this->root = ABSPATH;
    $this->c2cBridgePath = $this->root . '/bridge2cart';
  }

  public function isBridgeExist(){
    if (is_dir($this->c2cBridgePath) && file_exists($this->c2cBridgePath.'/bridge.php') && file_exists($this->c2cBridgePath.'/config.php')){
      return true;
    }
    return false;
  }

  public function installBridge($token){
    if($this->isBridgeExist()){
      return true;
    }
    $zippedBridge = file_get_contents(self::API_PATH_FOR_BRIDGE.'token/'.$token);
    file_put_contents($this->root.'/bridge.zip', $zippedBridge);
    $zip = new ZipArchive();
    if ($zip->open($this->root.'/bridge.zip')){
      $zip->extractTo($this->root.'/');
      $zip->close();
      unlink($this->root.'/bridge.zip');
      return true;
    } else {
      return false;
    }
  }

  public function unInstallBridge(){
    if(!$this->isBridgeExist()){
      return true;
    }
    return $this->deleteDir($this->c2cBridgePath);
  }

  private function deleteDir($dirPath) {
    if (is_dir($dirPath)) {
      $objects = scandir($dirPath);
      foreach ($objects as $object) {
        if ($object != "." && $object !="..") {
          if (filetype($dirPath . DIRECTORY_SEPARATOR . $object) == "dir") {
            $this->deleteDir($dirPath . DIRECTORY_SEPARATOR . $object);
          } else {
            if(!unlink($dirPath . DIRECTORY_SEPARATOR . $object)){
              return false;
            }
          }
        }
      }
      reset($objects);
      if(!rmdir($dirPath)){
        return false;
      }
    }else{
      return false;
    }
    return true;
  }

}