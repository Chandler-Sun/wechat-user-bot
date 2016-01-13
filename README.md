组装中的机器人
=================

> 我不说话，这是最好的。

注意: 这只是个组装中的机器人，作者还在探索。

(2016.1.13): 应该算是个高可用的机器人了。

(2016.1.12): 目前可以聊天了，为了防止污染群信息，暂时只允许私聊哈哈。若想响应群中at，需要知道群昵称。(负载稍高似乎偶尔会出现机器人连续回复两条的情况)；

(2016.1.11): 目前可以自动回复几秒内收到的最后一条消息。(有很多问题，慎用)；

作者仅仅为了：

1. 自己想要一个能进行信息收发的某国内顶级IM机器人。
2. 熟悉Node的http/https request 等模块，学习HTTP基本知识。
3. 学着Promise怎么使用，如果可以Stream如何玩，这么比较好的抽象整个流程
4. 学习使用浏览器调试工具，https代理等等。甚至透明代理，iptable这种东西。。

最重要的是：

5. 好奇
6. 聊以自娱

所以，这是一堆混乱不堪的东西，希望各位老师教我做人。

## 使用须知

请为了学习和娱乐适量使用，因此造成的任何损失、影响，都由使用者自行承担，与本人无关。源代码遵循GPL v2。

当前代码使用方式

    node test.js

扫描二维码后，在移动端点击确认登录，关闭二维码窗口。目前是个聊天机器人，对话引擎使用图灵机器人，暂时是我的apikey，如果达到上限请自行申请。

for fun and profit.

## 依赖

imagemagick： 

    sudo apt-get install imagemagick

request: 

    npm install request

## TODO

- [ ] 协议文档
- [X] 分离回复逻辑
- [ ] 修复已知问题

## ChangLog

### 2016.1.13

- 重新实现长轮询，修复多条消息会重新出现的问题 #5
- 分离回复逻辑 #2
- 捕获服务器断开消息自动退出 #1

### 2016.1.12

- 修复遗漏消息的问题
- 接入图灵机器人实现聊天机器人
- 清理代码
- 完成用request替换所有原生模块

### 2016.1.11

- 完成基本的回复机器人功能。
