package util

func twoSum(nums []int, target int) []int {
	store := make(map[int]int)
	for i, num := range nums {
		if val, ok := store[num]; ok {
			return []int{val, i}
		}
		store[target-num] = i
	}
	return nil
}
