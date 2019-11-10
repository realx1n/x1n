const path1 = "/x/resource/show/tab";
const path2 = "/x/v2/feed";
const path3 = "/x/v2/account/mine";
const path4 = "/x/v2/view";
const path5 = "/x/v2/view/material";
const path6 = "/x/v2/reply/main";

const url = $request.url;
var body = $response.body;

if (url.indexOf(path1) != -1){
body=JSON.parse(body)

body['data']['tab'].forEach((element, index) => {
if(!(["追番","推荐","直播","热门","影视"].includes(element["name"]))) body['data']['tab'].splice(index,1)  
});

body['data']['bottom'].forEach((element, index)=> {
    if(element['pos']==4){      
       body['data']['bottom'].splice(index,1)  
    }
})

delete body['data']['top']
body=JSON.stringify(body)
}

if (url.indexOf(path2) != -1){
body=JSON.parse(body)
body['data']['items'].forEach((element, index)=> {
    //block ad||title||up
   if(element.hasOwnProperty('ad_info')||element.hasOwnProperty('banner_item')||element['card_type']!="small_cover_v2"){ 
         body['data']['items'].splice(index,1)  
    }
})
body=JSON.stringify(body)
}

if (url.indexOf(path3) != -1){
body=JSON.parse(body)
body['data']['sections'].splice(0,1)
body['data']['sections'][0]['items'].splice(3,1)
body['data']['sections'][0]['items'].splice(4,3)
body['data']['sections'].splice(1,1)
body=JSON.stringify(body)
}

if (url.indexOf(path4) != -1){
body=JSON.parse(body)
body['data']['relates'].forEach((element, index)=> {
if(element.hasOwnProperty('is_ad') || element.hasOwnProperty('from')){
      body['data']['relates'].splice(index,1)  
    }
});
delete body['data']['cms']
body=JSON.stringify(body)
}

if (url.indexOf(path5) != -1){
body = JSON.parse(body)
body.data = null;
body = JSON.stringify(body);
}

if (url.indexOf(path6) != -1){
body = JSON.parse(body)
body.data.notice = {};
body = JSON.stringify(body);
}

$done({ body })

/**
 * @supported 362F170E F0DED3F9
 */