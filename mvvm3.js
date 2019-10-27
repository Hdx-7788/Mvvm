class Dep {
    constructor() {
        this.events = []
    }
    addEvents(watcher) {

        this.events.push(watcher)
    }
    change() {
        this.events.forEach(item => {
            // console.log(item)
            item.sendVal()
        })
    }
}
Dep.target = null
const dep = new Dep()
//创建监听  Warcher 
class Warcher {
    constructor(cbk, data, key) {
        this.data = data
        this.key = key
        this.cbk = cbk //回调
        Dep.target = this
        //第九部分 挂在到dep 静态属性上
        this.init()
    }
    init() {
        //判断.
        this.value = utils.getValue(this.data, this.key)

        return this.value
    }
    sendVal() {
        this.cbk(this.init())
    }
}
const utils = {
    getValue(data, key) {
        //   console.log(key)
        if (key.indexOf(".") > -1) {
            //说明存在. 
            let arr = key.split(".") //["",""]
            for (let i = 0; i < arr.length; i++) {
                data = data[arr[i]]
            }
            return data
        } else {
            return data[key]
        }
    },
    changeVal(data, key, value) {
        if (key.indexOf(".") > -1) {
            let arr = key.split(".")//['ipt','username','name']
            for (let i = 0; i < arr.length - 1; i++) {
                data = data[arr[i]]
            }
            data[arr[arr.length - 1]] = value
        } else {
            data[key] = value
        }
    }
}
class ObServer {
    constructor(data) {
        if (typeof data !== "object") {
            //不等于对象到时候直接 返回
            return
        }
        this.data = data
        this.init()
    }
    init() {
        Object.keys(this.data).forEach(item => {
            this.ObServer(this.data, item, this.data[item])
        })
    }
    ObServer(obj, key, value) {
        //第三部实现数据监听 返回value
        new ObServer(obj[key])
        //递归调用子元素
        Object.defineProperty(obj, key, {
            get() {
                if (Dep.target) {
                    dep.addEvents(Dep.target)
                }
                return value
            },
            set(newValue) {
                // if(value==newValue){
                //     return
                // }
                value = newValue
                dep.change()
                new ObServer(value)
            }
        })
    }
}
class Mvvm {
    constructor({ el, data }) {
        //第一步
        //获取到el与data
        this.el = document.getElementById(el)
        this.data = data
        this.init()//初始化方法
        this.initDome() //创建虚拟dom
    }
    init() {
        //第二步实现数据监听
        new ObServer(this.data) //把data数据传入进去
    }
    initDome() {
        //第四步创建文本碎片
        const newFragment = this.createFragment() //返回出来当然input下面的文本
        this.compiler(newFragment)//第五部分根据节点判断 设置相应内容
        this.el.appendChild(newFragment)
    }
    createFragment() {
        let newFragment = document.createDocumentFragment()
        while (this.el.firstChild) {
            newFragment.appendChild(this.el.firstChild)
            //文本下面放入节点 input 与div
        }
        return newFragment
    }
    compiler(node) {
        //根据文本节点判断类型
        if (node.nodeType === 1) {
            //第六部分  如果节点为1 为元素节点 
            let attribute = Array.from(node.attributes)
            //循环attribute判断当前元素绑定了v-module属性
            attribute.forEach(item => {
                if (item.name === "v-model") {
                    node.value = utils.getValue(this.data, item.nodeValue)
                    //
                    node.oninput = e => {
                        utils.changeVal(this.data, item.nodeValue, e.target.value)
                    }
                }
            })
        } else if (node.nodeType === 3) {
            //第7部分 如果为<div>{{}}</div>
            if (node.textContent.indexOf("{{") > -1 && node.textContent.indexOf("}}") > -1) {
                const contentvalue = node.textContent.slice(node.textContent.indexOf("{{") + 2, node.textContent.indexOf("}}"))
                node.textContent = utils.getValue(this.data, contentvalue)
                console.log(this.data, 'data')
                console.log(contentvalue, 'value')
                //第八部分监听
                new Warcher((newVal) => {
                    node.textContent = newVal
                }, this.data, contentvalue)

                //设置文本内容 
            }
        }
        if (node.childNodes.length > 0) {
            //递归调用自己 获取到每个元素的节点 
            node.childNodes.forEach(item => {
                this.compiler(item)
            })
        }
    }
}


