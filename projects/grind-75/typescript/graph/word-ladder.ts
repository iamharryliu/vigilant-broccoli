export function ladderLength(beginWord: string, endWord: string, wordList: string[]): number {
    if (!wordList.includes(endWord)) return 0;
    const graph: Record<string, string[]> = {};
    const addToGraph = (key: string, word: string) => {
        if (!(key in graph)) {
            graph[key] = [];
        }
        graph[key].push(word);
    };

    for (const word of wordList.concat(beginWord)) {
        for (let i = 0; i < word.length; i++) {
            const key = word.slice(0, i) + "*" + word.slice(i + 1);
            addToGraph(key, word);
        }
    }

    const q: string[] = [beginWord];
    const visited: Set<string> = new Set();
    let res = 0;
    while (q.length) {
        res += 1;
        const levelSize = q.length;
        for (let i = 0; i < levelSize; i++) {
            const word = q.shift()!;
            if (word === endWord) {
                return res;
            }

            for (let j = 0; j < word.length; j++) {
                const key = word.slice(0, j) + "*" + word.slice(j + 1);
                if (!visited.has(key)) {
                    if (key in graph) {
                        q.push(...graph[key]);
                    }
                    visited.add(key);
                }
            }
        }
    }

    return 0;
}