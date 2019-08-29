# 个人规则

**整合版**
```
[Rule]
RULESET,https://github.com/lorexu/conf/raw/master/zhihu_ad.list,REJECT
[Script]
# 知乎去广告
http-response ^https?:\/\/api\.zhihu\.com\/(moments\?|topstory\/recommend|.*\/questions|market\/header) requires-body=1,max-size=-1,script-path=https://raw.githubusercontent.com/ydzydzydz/Rules/master/Surge/resources/script/zhihu.js

# 哔哩哔哩去广告
http-response ^https?:\/\/ap(i|p).bilibili.com\/x\/(resource\/show\/tab|v2\/(reply\/main|view\/material|account\/mine|view|feed\/index)\?access_key) requires-body=1,max-size=-1,script-path=https://github.com/lorexu/conf/raw/master/bilibili.js

# 微博去广告
http-response ^https?:\/\/(api|mapi)\.weibo\.(cn|com)\/2(\/groups\/timeline|\/statuses\/unread|\/statuses\/extend|\/comments\/build_comments|\/photo\/recommend_list|\/stories\/video_stream|\/statuses\/positives\/get|\/stories\/home_list|\/profile\/statuses|\/statuses\/friends\/timeline|\/service\/picfeed) script-path=https://github.com/lorexu/conf/raw/master/script/weibo_ad.js,requires-body=true
http-response ^https?:\/\/(sdk|wb)app\.uve\.weibo\.com(\/interface\/sdk\/sdkad.php|\/wbapplua\/wbpullad.lua) script-path=https://raw.githubusercontent.com/lorexu/conf/master/script/weibo_launch.js,requires-body=true

[MITM]
hostname = api.zhihu.com,api.bilibili.com,api.weibo.cn, mapi.weibo.com, *.uve.weibo.com
```


**知乎去广告**
```
[Rule]
# RULESET,https://github.com/lorexu/conf/raw/master/zhihu_ad.list
URL-REGEX,https://(api|www).zhihu.com/(fringe|zst|commercial|real_time|ad-style-service|banners|topstory/hot-lists|market/popover|mqtt|.*(launch|featured-comment-ad|recommendations|community-ad)|search/(top|tab|preset)|ab),REJECT
AND,((USER-AGENT,ZhihuHybrid*), (NOT,((DOMAIN-SUFFIX,zhihu.com))), (NOT,((DOMAIN-SUFFIX,zhimg.com)))),REJECT
AND,((USER-AGENT,osee2*), (NOT,((DOMAIN-SUFFIX,zhihu.com))), (NOT,((DOMAIN-SUFFIX,zhimg.com)))),REJECT

[Script]
http-response ^https?:\/\/api\.zhihu\.com\/(moments\?|topstory\/recommend|.*\/questions|market\/header) requires-body=1,max-size=-1,script-path=https://raw.githubusercontent.com/ydzydzydz/Rules/master/Surge/resources/script/zhihu.js

[MITM]
hostname = api.zhihu.com
```


**B站去广告**
```
[Script]
# 哔哩哔哩（N合一版）（原作者：onewayticket255 修改：Primovist）
http-response ^https?:\/\/ap(i|p).bilibili.com\/x\/(resource\/show\/tab|v2\/(reply\/main|view\/material|account\/mine|view|feed\/index)\?access_key) requires-body=1,max-size=-1,script-path=https://github.com/lorexu/conf/raw/master/bilibili.js

[MITM]
hostname = api.bilibili.com
```

**微博去广告**
```
[Script]
# 微博去广告 （作者：yichahucha）
http-response ^https?:\/\/(api|mapi)\.weibo\.(cn|com)\/2(\/groups\/timeline|\/statuses\/unread|\/statuses\/extend|\/comments\/build_comments|\/photo\/recommend_list|\/stories\/video_stream|\/statuses\/positives\/get|\/stories\/home_list|\/profile\/statuses|\/statuses\/friends\/timeline|\/service\/picfeed) script-path=https://github.com/lorexu/conf/raw/master/script/weibo_ad.js,requires-body=true
http-response ^https?:\/\/(sdk|wb)app\.uve\.weibo\.com(\/interface\/sdk\/sdkad.php|\/wbapplua\/wbpullad.lua) script-path=https://raw.githubusercontent.com/lorexu/conf/master/script/weibo_launch.js,requires-body=true

[MITM]
hostname = api.weibo.cn, mapi.weibo.com, *.uve.weibo.com
```
