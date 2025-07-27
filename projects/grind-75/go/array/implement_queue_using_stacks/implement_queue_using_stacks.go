package main

type MyQueue struct {
	input  []int
	output []int
}

func Constructor() MyQueue {
	return MyQueue{
		input:  []int{},
		output: []int{},
	}
}

func (this *MyQueue) Push(x int) {
	this.input = append(this.input, x)
}

func (this *MyQueue) transfer() {
	if len(this.output) == 0 {
		for len(this.input) > 0 {
			n := len(this.input)
			// Pop from input
			val := this.input[n-1]
			this.input = this.input[:n-1]
			// Push to output
			this.output = append(this.output, val)
		}
	}
}

func (this *MyQueue) Pop() int {
	this.transfer()
	n := len(this.output)
	val := this.output[n-1]
	this.output = this.output[:n-1]
	return val
}

func (this *MyQueue) Peek() int {
	this.transfer()
	return this.output[len(this.output)-1]
}

func (this *MyQueue) Empty() bool {
	return len(this.input) == 0 && len(this.output) == 0
}

/**
 * Your MyQueue object will be instantiated and called as such:
 * var obj = new MyQueue()
 * obj.push(x)
 * var param_2 = obj.pop()
 * var param_3 = obj.peek()
 * var param_4 = obj.empty()
 */
