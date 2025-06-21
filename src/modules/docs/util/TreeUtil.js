/**
 * 由一个结点数组来解析成树形结构
 * options:
 *   titleKey: 结点名称对应的key，即结点显示时的文本
 *   dataKeys: 自定义数据的key组成的数组
 *   withParentRef: 结点是否保留父结点的引用
 *   rootId: 根结点的id
 *   returnRoot: 返回的树是否包含根结点
 */
export const parseTree = (nodes, options) => {
    if (!nodes || nodes.length <= 0) {
        return null;
    }
    options = options || { titleKey: 'title', };
    options.titleKey = options.titleKey || 'title';
    let rootId = '';
    let copyList = nodes.slice();
    let root = {
        id: rootId,
        title: '无',
        depth: 0,
        parentId: rootId,
        children: [],
    };
    if (options.withParentRef) {
        root.parent = null;
    }
    let stores = [];
    stores.push(root);

    while (stores.length) {
        let tree = stores[0];
        for (let i = copyList.length - 1; i >= 0; i--) {
            copyList[i].parentId = copyList[i].parentId || rootId;
            if (copyList[i].parentId === tree.id) {
                let node = {
                    id: copyList[i].id,
                    title: copyList[i][options.titleKey],
                    depth: tree.depth + 1,
                    parentId: tree.id,
                    children: [],
                };
                if (options.withParentRef) {
                    node.parent = tree;
                }
                if (options.dataKeys) {
                    for (let j = 0; j < options.dataKeys.length; j++) {
                        let key = options.dataKeys[j];
                        node[key] = copyList[i][key];
                    }
                }
                stores.push(node);
                tree.children.push(node);
                copyList.splice(i, 1);
            }
        }
        stores.splice(0, 1);
    }
    if (options.returnRoot) {
        return root;
    }
    return root.children;
};

/**
 * 将一棵树转成一维数组, 可用来生成图书章节目录树
 * options:
 *   returnRoot: 返回的树是否包含根结点
 */
export const tree2Array = (root, options) => {
    let tempArr = [ root ];
    if (Object.prototype.toString.call(root)== '[object Array]') {
        tempArr = root.slice(0);
    }
    let traverseArr = [];
    while (tempArr.length) {
        const node = tempArr.splice(0, 1)[0];
        traverseArr.push(node);
        if (node.children && node.children.length) {
            tempArr = node.children.concat(tempArr);
        }
    }
    return traverseArr;
};

export const getTreeNode = (id, treeData) => {
    let nodes = treeData.slice(0);
    while (nodes.length) {
        let node = nodes[0];
        if (node.id !== id) {
            let children = node.children;
            if (children && children.length > 0) {
                nodes = nodes.concat(children);
            }
            nodes.shift();
        } else {
            return node;
        }
    }
    return null;
};

/**
 * 返回node的最后一个叶子结点
 */
export const getLastLeafChild = (node) => {
    if (!node.children || node.children.length <= 0) {
        return null;
    }
    while (node.children && node.children.length) {
        node = node.children[node.children.length - 1];
    }
    return node;
};

export const getPrevNode = (node, treeData) => {
    let parent = getTreeNode(node.parentId, treeData);
    if (parent) {
        let index = parent.children.indexOf(node);
        if (index > 0) {
            let theNode = parent.children[index - 1];
            let lastLeafChild = getLastLeafChild(theNode);
            return lastLeafChild || theNode;
        }
        return parent;
    } else {
        let index = treeData.indexOf(node);
        let theNode = treeData[index - 1];
        if (!theNode) {
            return null;
        }
        let lastLeafChild = getLastLeafChild(theNode);
        return lastLeafChild || theNode;
    }
};

export const getFirstParentBrother = (node, treeData) => {
    let parent = getTreeNode(node.parentId, treeData);
    while (parent) {
        let index = parent.children.indexOf(node);
        if (parent.children[index + 1]) {
            return parent.children[index + 1];
        }
        node = parent;
        parent = getTreeNode(node.parentId, treeData);
    }
    let index = treeData.indexOf(node);
    return treeData[index + 1] || null;
};

export const getNextNode = (node, treeData) => {
    if (node.children && node.children.length > 0) {
        return node.children[0];
    }
    let parent = getTreeNode(node.parentId, treeData);
    if (parent) {
        let index = parent.children.indexOf(node);
        if (parent.children[index + 1]) {
            return parent.children[index + 1];
        }
        return getFirstParentBrother(parent, treeData);
    } else {
        let index = treeData.indexOf(node);
        return treeData[index + 1] || null;
    }
};
