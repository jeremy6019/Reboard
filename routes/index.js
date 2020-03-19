var express = require('express');
var router = express.Router();
var mysql = require("mysql");

const conStr={
  host:"localhost",
  user:"root",
  password:"1234",
  database:"ios"
};

//답변 요청처리 
router.post("/reply",function(request,response){
  //파라미터 받기
  var title = request.body.title;
  var writer = request.body.writer;
  var content = request.body.content;
  var team = request.body.team;
  var rank = request.body.rank;
  var depth =request.body.depth;
 
  var con = mysql.createConnection(conStr);
  con.connect();
  //현재 내가 본글보다 아래에 있는 같은 그룹내의 모든 글들은 자리를 한칸씩 물러나라!!
  var sql = "update reboard set rank=rank+1 where team=?  and rank > ?";
  con.query(sql,[team,rank],function(err,result,fields){
    if(err){
      consiole.log(err);
    }else{
      //답변 게시판에서 가장 중요하고 중삼아 되는 것은 ? 내가 본글!!!
      rank = parseInt(rank)+1; //내가 본글보다 바로 아래에 있어야 하므로... 
      depth = parseInt(depth)+1; //내가 본글에 대한 답변이므로 내가 본글보다 언재나 1크더 
      sql = "insert into reboard(title,writer,content,team,rank,depth) values(?,?,?,?,?,?)";
      con.query(sql,[title,writer,content,team,rank,depth],function(e,r,f){
        if(e){
          console.log(e);
        }else{
          //답변을 단후에는 목록을 보여주자 
          response.redirect("/board/list");
        }
        con.end();
      });
    }
  });
  


});



//상세보기 요청처리 
router.get("/content", function(request,response){
  var reboard_id = request.query.reboard_id;
  var con = mysql.createConnection(conStr);
  con.connect();

  var sql = "select * from reboard where reboard_id=?";
  con.query(sql,[reboard_id], function(err,result,fields){
    if(err){
      console.log(err);
    }else{
      //상세페이지 렌더링 InternalResourceViewResolver 접미어 뺴야함 
      response.render('board/content', {result:result[0]});//게시물 한건이 들어있음 
      //주의 result는 배열이다 
      
    }
    con.end();
  });
});

/* GET home page. */
router.get('/list', function(req, res, next) {
  var con = mysql.createConnection(conStr);
  con.connect();
  //같은 팀내에서 또 다른 정렬을 적용 
  var sql = "select * from reboard order by team asc, rank asc";
  con.query(sql,function(err, result, fields){
    res.render('board/list', { result:result });//제이슨아 배열에 들어있음 
    con.end();
  });
  
});


router.post("/regist", function(request,response){
  const title = request.body.title;
  const writer = request.body.writer;
  const content = request.body.content;

  console.log(title,",",writer,",",content);

  var con = mysql.createConnection(conStr);
  con.connect();
  var sql = "insert into reboard(title, writer, content) values(?,?,?)";
  con.query(sql,[title,writer,content],function(err,result,fields){
    if(err){
      console.log(err);
    }else{
      //방금 insert된 레코드의 primary key값을 추출하여 team의 값을 update하자!!
      sql = "select last_insert_id() as reboard_id from reboard";
      //오라클의 경우 
      //select 시퀀스.currval from dual;
      //dual이란? 컬럼과 레코드가 달랑 1개씩인 더미 테이블 
      con.query(sql, function(e,r,f){
        console.log("last_id값은:",r);

        var reboard_id = r[0].reboard_id;

        if(e){
          console.log(e);
        }else{
          
          sql = "update reboard set team=? where reboard_id=?";
          con.query(sql,[reboard_id,reboard_id],function(er,re,fd){
          if(er){
            console.log(er);
          }else{
            response.redirect("/board/list"); //지정한 url로 재접속을 명령(브라우저에게)
          }
          con.end();     
          });
          
        }
      });

      
    }
    
  });
  

});

module.exports = router;
