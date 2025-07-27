package util

import (
	"reflect"
	"testing"
)

func TestTwoSum(t *testing.T) {
	tests := []struct {
		nums   []int
		target int
		want   []int
	}{
		{nums: []int{2, 7, 11, 15}, target: 9, want: []int{0, 1}},
		{nums: []int{3, 2, 4}, target: 6, want: []int{1, 2}},
		{nums: []int{3, 3}, target: 6, want: []int{0, 1}},
	}

	for _, testCase := range tests {
		t.Run("", func(t *testing.T) {
			got := twoSum(testCase.nums, testCase.target)
			if !reflect.DeepEqual(got, testCase.want) {
				t.Errorf("twoSum(%v, %d) = %v; want %v", testCase.nums, testCase.target, got, testCase.want)
			}
		})
	}
}
