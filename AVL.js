import "babel-polyfill";

const BinaryTree = (() => {
    // clojure occuring (private vars)
    let numOfNodes = 0;
    let root = null;
    let childNodeConnectPos = null;

    return class {
        constructor(v,l=null,r=null) {
            this.value = v;
            this.left = l;
            this.right = r;
            this.init(v);
        }
        * [Symbol.iterator]() {
            yield this.value;
            if(this.left) yield* this.left;
            if(this.right) yield* this.right;
        }
        init(v) {
            root = (numOfNodes === 0) ? this : root;
        }
        static getRoot() {
            return root;
        }
        static getNodeNum() {
            return numOfNodes;
        }
        static setData(n,v) {
            n.value = v;
            numOfNodes++;
        }
        static getData(n) {
            return n.value;
        }
        static insert(flag,v,subTree = root,pNode,direction) {
            let tmp;
            if(subTree === null) {
                if(flag.y > 360) {
                    flag.y = 90;
                    flag.x = 0;
                    flag.rotation = [];
                    flag.rotationBaseNode = undefined;
                    flag.increaseNum = 0;
                    return 'unable';
                }

                let newNode = new BinaryTree();
                this.setData(newNode,v);
                
                if(pNode) {
                    switch(direction) {
                        case 'left' : { 
                            pNode.left = newNode; 
                            flag.pv = pNode.value;
                        }
                        break;
                        case 'right' : { 
                            pNode.right = newNode; 
                            flag.pv = pNode.value;
                        }
                        break;
                    }
                }

                return newNode;
            } else if(v < this.getData(subTree)) {
                flag.x -= flag.increase[flag.increaseNum];
                flag.y += 90;
                flag.increaseNum++;

                if(this.insert(flag,v,subTree.left,subTree,'left') !== 'unable') {
                    tmp = this.rebalance(subTree,flag);
                    childNodeConnectPos = (pNode && pNode.left === subTree) ? 'left' : 'right'; // subTree가 pNode의 left인지 right인지만 알면 리밸런싱후 노드붙일수있음
                    
                    if(tmp !== subTree) { // 리밸런스가 됬다는뜻
                        if(pNode && childNodeConnectPos === 'left')
                            pNode.left = tmp;
                        else if(pNode && childNodeConnectPos === 'right')
                            pNode.right = tmp;
                        else
                            root = tmp;
                    }
                } else
                    return 'unable';
            } else if(v > this.getData(subTree)) {
                flag.x += flag.increase[flag.increaseNum];
                flag.y += 90;
                flag.increaseNum++;

                if(this.insert(flag,v,subTree.right,subTree,'right') !== 'unable') {
                    tmp = this.rebalance(subTree,flag);
                    childNodeConnectPos = (pNode && pNode.left === subTree) ? 'left' : 'right'; // subTree가 pNode의 left인지 right인지만 알면 리밸런싱후 노드붙일수있음

                    if(tmp !== subTree) {  // 리밸런스가 됬다는 뜻
                        if(pNode && childNodeConnectPos === 'right')
                            pNode.right = tmp;
                        else if(pNode && childNodeConnectPos === 'left')
                            pNode.left = tmp;
                        else
                            root = tmp;
                    }
                } else
                    return 'unable';
            } else {
                console.log('중복!');
                flag.check = null;
                return null;
            }
        }
        static delete(flag,v) {
            let pVRoot = new BinaryTree(), // virtual node
                pNode = pVRoot,
                cNode = root,
                dNode;

            numOfNodes--;

            pVRoot.right = root; // To prevent unexpected circustance

            while(cNode != null && this.getData(cNode) !== v) {
                pNode = cNode;
                cNode = (v < this.getData(cNode)) ? cNode.left : cNode.right;
            }
            if(cNode === null) 
                return null;

            dNode = cNode;

            // 1st measure (단말노드인경우)
            if(dNode.left === null && dNode.right === null) {
                if(pNode.left === dNode)
                    pNode.left = null;
                else
                    pNode.right = null;
            } else if(dNode.left === null || dNode.right === null) {  // 2nd measure (하나의 자식노드를 갖는경우)
                let dcNode = (dNode.left !== null) ? dNode.left : dNode.right;
                
                if(pNode.left === dNode)
                    pNode.left = dcNode;
                else
                    pNode.right = dcNode;
            } else { // 3th measure (두개의 자식 노드를 모두 갖는 경우)
                let mNode = dNode.right,
                    mpNode = dNode,
                    delData;

                // 왼쪽서브트리에서 가장큰값으로 대채.
                while(mNode.left !== null) {
                    mpNode = mNode;
                    mNode = mNode.left;
                }
                // 값을 대채하는것으로 노드의 삭제구현.
                delData = this.getData(dNode);
                this.setData(dNode,this.getData(mNode));
                numOfNodes--;

                if(mpNode.left === mNode)
                    mpNode.left = mNode.right;
                else
                    mpNode.right = mNode.right;

                dNode = mNode;
                this.setData(dNode,delData);
                numOfNodes--;
            }

            if(pVRoot.right !== root)
                root = pVRoot.right;
            
            root = this.rebalance(root,flag); // 현재 루트노드기준으로만 리밸런싱함. 차후에 insert함수처럼 바꿔야 할듯
            return dNode;
        }
        static search(v,obj) {
            let cNode = root;

            while(cNode !== null) {
                if(obj) {
                    obj.cnt++;
                    obj.values.push(cNode.value);
                }

                if(v === this.getData(cNode))
                    return cNode;
                else if(v < this.getData(cNode)) 
                    cNode = cNode.left;
                else
                    cNode = cNode.right;
            }

            return null;
        }
        static rotateLL(subTree,flag) {
            let pNode = subTree,
                cNode = pNode.left;
            
            pNode.left = cNode.right;
            cNode.right = pNode;
            
            flag.rotation.push('LL');
            flag.rotationBaseNode = cNode;

            return cNode;
        }
        static rotateRR(subTree,flag) {
            let pNode = subTree,
                cNode = pNode.right;

            pNode.right = cNode.left;
            cNode.left = pNode;

            flag.rotation.push('RR');
            flag.rotationBaseNode = cNode;

            return cNode;
        }
        static rotateRL(subTree,flag) {
            let pNode = subTree,
                cNode = pNode.right,
                ret;

            pNode.right = this.rotateLL(cNode,flag);
            ret = this.rotateRR(pNode,flag);
            flag.rotationBaseNode = ret;
            return ret;
        }
        static rotateLR(subTree,flag) {
            let pNode = subTree,
                cNode = pNode.left,
                ret;

            pNode.left = this.rotateRR(cNode,flag);
            ret =  this.rotateLL(pNode,flag);
            flag.rotationBaseNode = ret;
            return ret;
        }
        static getHeight(subTree) {  // 이 함수를 이터레이블하게 만들고싶지만 이미 Symbol.iterator를 정의했으므로 하지못함.
            let leftH,rightH;

            if(subTree === null) return 0;

            leftH = this.getHeight(subTree.left);
            rightH = this.getHeight(subTree.right);

            if(leftH > rightH)
                return leftH + 1;
            else
                return rightH + 1;            
        }
        static getHeightDiff(subTree) { // 이 함수를 이터레이블하게 만들고싶지만 이미 Symbol.iterator를 정의했으므로 하지못함.
            let lsh,rsh;

            if(subTree === null) return 0;

            lsh = this.getHeight(subTree.left);
            rsh = this.getHeight(subTree.right);

            // console.log(lsh - rsh);

            return lsh - rsh;
        }

        static rebalance(subTree,flag) { // 삽입,삭제될때마다 그 부모노드의 부모노드, 부모노드의 부모노드의 부모노드... 이렇게 재귀적으로 올라가면서 균형인수를 검사.
            let hDiff = this.getHeightDiff(subTree);
            console.log(hDiff);
            if(hDiff > 1) 
                subTree = (this.getHeightDiff(subTree.left) > 0) ? this.rotateLL(subTree,flag) : this.rotateLR(subTree,flag);
            
            if(hDiff < -1)
                subTree = (this.getHeightDiff(subTree.right) < 0) ? this.rotateRR(subTree,flag) : this.rotateRL(subTree,flag);    

            return subTree;    
        }
    }
})();

export { BinaryTree }











/*

BinaryTree.insert(71);
BinaryTree.insert(40);
BinaryTree.insert(82);
BinaryTree.insert(18);
BinaryTree.insert(58);
BinaryTree.insert(79);
BinaryTree.insert(85);
BinaryTree.insert(100);
BinaryTree.insert(90);


var a = BinaryTree.getRoot();
for(var i of a) console.log(i);

*/