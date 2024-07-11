class MinStack:
    def __init__(self):
        self.stack = []
        self.minStack = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        if not self.minStack:
            self.minStack.append(val)
        elif self.minStack[-1] >= val:
            self.minStack.append(val)
        elif self.minStack[-1] < val:
            self.minStack.append(self.minStack[-1])

    def pop(self) -> None:
        self.minStack.pop()
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.minStack[-1]


# Your MinStack object will be instantiated and called as such:
# obj = MinStack()
# obj.push(val)
# obj.pop()
# param_3 = obj.top()
# param_4 = obj.getMin()


"""
Time Complexity - push - O(1)
Time Complexity - pop - O(1)
Time Complexity - top - O(1)
Time Complexity - getMin - O(1)
Space Complexity - O(n)
"""
