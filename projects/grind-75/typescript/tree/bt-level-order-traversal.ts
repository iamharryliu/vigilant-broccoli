import { TreeNode } from "./common"

export default function levelOrder(root: TreeNode | null): number[][] {
    
    if(!root) return []
    const q = [root]
    const res = []

    while (q.length){
        res.push(q.map(node=>node.val))
        const currLenQ = q.length
        for(let i=0; i< currLenQ; i++){
            const node = q.shift()!
            if(node.left){
                q.push(node.left)
            }
            if(node.right){
                q.push(node.right)
            }
        }
    }

    return res
};