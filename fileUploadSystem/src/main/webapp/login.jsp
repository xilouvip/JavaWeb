<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
<title>Insert title here</title>

<script src="https://cdn.bootcss.com/jquery/2.1.1/jquery.min.js"></script>
<script src="https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
<script>
$(document).ready(function(){
  $("#loginbutton").click(function(){
    $(".form-horizontal").hide();
    $("#loginbutton").hide();
    $("#upload").show();
    $("#uploadbutton").show();
    
  });
});
$(document).ready(function(){
	  $("#uploadbutton").click(function(){
	    $("#upload").hide();
	    $("#uploadbutton").hide();
	    $("#tablelist").show();
	    $("#updatebutton").show();
	  });
	});
</script>
</head>
<body>
<form class="form-horizontal">
  <div class="form-group">
    <label for="inputUsername" class="col-sm-2 control-label">用户名</label>
    <div class="col-sm-10">
      <input type="text" class="form-control" id="inputUsername" placeholder="用户名">
    </div>
  </div>
  <div class="form-group">
    <label for="inputPassword" class="col-sm-2 control-label">密码</label>
    <div class="col-sm-10">
      <input type="password" class="form-control" id="inputPassword" placeholder="密码">
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
      <div class="checkbox">
        <label>
          <input type="checkbox">记住我
        </label>
      </div>
    </div>
  </div>
 <div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
      <button id ="loginbutton" type="submit" class="btn btn-success">登录</button>
    </div>
  </div>

</form>


  
 <form id="upload" style="display:none">
  <div class="form-group">
    <label for="exampleInputFile">请选择要上传的文件</label>
    <input type="file" id="exampleInputFile">
  </div>
  <button id="uploadbutton" type="submit" class="btn btn-success" style="display:none">上传</button>
  
</form>

<table id="tablelist" class="table table-bordered" style="display:none">
    <tr>
        <th>姓名</th>
        <th>性别</th>
        <th>联系方式</th>
    </tr>
    <tr>
        <td>1</td>
        <td>2</td>
        <td>3</td>
    </tr>

</table>
  <button id="updatebutton" type="submit" class="btn btn-success" style="display:none">更新</button>
  
</body>


</html>