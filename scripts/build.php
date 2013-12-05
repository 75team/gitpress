<?php
	require_once "Fl/src/Fl.class.php";

	$options = array (
		"remove_last_semicolon" => true,  //去除单个selector中最后一个;
		"remove_empty_selector" => true,  //取出空selector
		"override_same_property" => true,  //覆盖相同的属性
		"short_value" => true,  //简化value值
		"merge_property" => false,  //合并属性
		"sort_property" => true,  //对属性进行排序
		"sort_selector" => true,  //对selector进行排序
		"merge_selector" => true,  //合并selector
		"property_to_lower" => true  //属性名小写
	);

	Fl::loadClass("Fl_Css_Compress"); //通过Fl:loadClass方法加载Fl_Css_Compress类

	$root = "../www/static";
	
	if(!file_exists($root."/../output")){
		mkdir($root."/../output");
	}

	///build...css...

	$templates = array(
		//"default" 	=> $root."/default/css",
		//"slate" 	=> $root."/slate/css",
		//"tactile" 	=> $root."/tactile/css",
		//"phase"		=> $root."/phase/css",
		"pithiness"	=> $root."/pithiness/css",
		//"greyshade" => $root."/greyshade/css",
	);

	foreach ($templates as $k => &$v){
		if(is_dir($v)){
			$screen = '';
			$print = '';
			
			if(!file_exists($root."/../output/".$k)){
				mkdir($root."/../output/".$k);
			}

			if(!file_exists($root."/../output/".$k."/css")){
				mkdir($root."/../output/".$k."/css");
			}

			$dp=dir($v);
			while($filename=$dp->read())
				if($filename!='.'&&$filename!='..'){
					$file = $v.'/'.$filename;
					$type = pathinfo($file); 
					if(trim($type['extension']) == 'css'){
						if($filename != 'print.css'){
							$screen .= file_get_contents($file)."\n";
						}else{
							$print .= file_get_contents($file)."\n";
						}
					}else{
						copy($file, $root."/../output/".$k."/css/".$filename);
					}
				}
			$dp->close();

			$instance = new Fl_Css_Compress($screen);
			$instance->tpl = "Ejs"; 
			$instance->ld = "<%";
			$instance->rd = "%>";
			$output = $instance->run($options); 
			
			$fp = fopen($root."/../output/".$k."/css/stylesheet.css", "w");
			fwrite($fp, $output);
			fclose($fp); 	

			if($print != ''){
				$instance = new Fl_Css_Compress($print);
				$instance->tpl = "Ejs"; 
				$instance->ld = "<%";
				$instance->rd = "%>";
				$output = $instance->run($options); 
				
				$fp = fopen($root."/../output/".$k."/css/print.css", "w");
				fwrite($fp, $output);
				fclose($fp); 				
			}		
		}
	}


	///...

	///copy images...

	$templates = array(
		/*"default" 	=> $root."/default/img",
		"slate" 	=> $root."/slate/img",
		"tactile" 	=> $root."/tactile/img",
		"phase"		=> $root."/phase/img",
		"pithiness"	=> $root."/pithiness/img",
		"greyshade"	=> $root."/greyshade/img",*/
	);

	foreach ($templates as $k => &$v){
		if(is_dir($v)){
			
			if(!file_exists($root."/../output/".$k)){
				mkdir($root."/../output/".$k);
			}

			if(!file_exists($root."/../output/".$k."/img")){
				mkdir($root."/../output/".$k."/img");
			}

			$dp=dir($v);
			while($filename=$dp->read())
				if($filename!='.'&&$filename!='..'){
					$file = $v.'/'.$filename;
					copy($file, $root."/../output/".$k."/img/".$filename);
				}
			$dp->close();
		}
	}


	///copy font...

	$templates = array(
		//"greyshade"		=> $root."/greyshade/font",
	);

	foreach ($templates as $k => &$v){
		if(is_dir($v)){
			
			if(!file_exists($root."/../output/".$k)){
				mkdir($root."/../output/".$k);
			}

			if(!file_exists($root."/../output/".$k."/font")){
				mkdir($root."/../output/".$k."/font");
			}

			$dp=dir($v);
			while($filename=$dp->read())
				if($filename!='.'&&$filename!='..'){
					$file = $v.'/'.$filename;
					copy($file, $root."/../output/".$k."/font/".$filename);
				}
			$dp->close();
		}
	}

	///...

	$templates = array(
		//"default" 	=> $root."/default/js",
		//"slate" 	=> $root."/slate/js",
		//"tactile" 	=> $root."/tactile/js",
		//"phase"		=> $root."/phase/js",
		//"pithiness"		=> $root."/pithiness/js",
		//"greyshade"		=> $root."/greyshade/js",
	);

	foreach ($templates as $k => &$v){
		if(is_dir($v)){
			
			if(!file_exists($root."/../output/".$k)){
				mkdir($root."/../output/".$k);
			}

			if(!file_exists($root."/../output/".$k."/js")){
				mkdir($root."/../output/".$k."/js");
			}

			$dp=dir($v);
			while($filename=$dp->read())
				if($filename!='.'&&$filename!='..'){
					$file = $v.'/'.$filename;
					$type = pathinfo($file); 
					if(trim($type['extension']) == 'js'){
						exec("uglifyjs ".$file. " -o ". $root."/../output/".$k."/js/".$filename);
					}
				}
			$dp->close();
		}
	}	

	exec("qrsync qiniu-conf.json");