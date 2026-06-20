import { Pattern } from '../types';

export const PATTERNS: Pattern[] = [
{
    id: 'two-pointers',
    name: '1. Two Pointers',
    description: 'Coordinate two indices to process a sorted array or list efficiently, reducing time complexity from O(n²) to O(n).',
    recognitionClues: ['Sorted Array', 'Pair Sum', 'Palindrome', 'Opposite direction traversal'],
    template: 'while left < right:\n    if current_sum == target:\n        return [left, right]\n    elif current_sum < target:\n        left += 1\n    else:\n        right -= 1',
    difficulty: 'Easy',
    problems: [
{
        patternId: 'two-pointers',
        id: 'two-sum-ii',
        title: 'Two Sum II - Input Array Is Sorted',
        statement: 'Given a 1-indexed array of integers sorted in non-decreasing order, find two numbers such that they add up to a specific target number.',
        difficulty: 'Easy',
        companyTags: ['Google', 'Amazon'],
        hints: ['Use two pointers starting from opposite ends.'],
        approach: 'Since the array is sorted, we can adjust the pointers based on whether the current sum is too high or too low.',
        solution: 'def twoSum(numbers, target):\n    left, right = 0, len(numbers) - 1\n    while left < right:\n        s = numbers[left] + numbers[right]\n        if s == target:\n            return [left + 1, right + 1]\n        elif s < target:\n            left += 1\n        else:\n            right -= 1\n    return []',
        complexity: {
          time: 'O(n)',
          space: 'O(1)'
        },
        sampleInput: 'numbers = [2,7,11,15], target = 9',
        sampleOutput: '[1,2]',
        inputType: 'Array of integers (sorted), Integer',
        inputLength: '2 <= numbers.length <= 3 * 10^4',
        outputLength: '2 (indices of two numbers)'
      },
{
        patternId: 'two-pointers',
        id: 'valid-palindrome',
        title: 'Valid Palindrome',
        statement: 'Determine if a string is a palindrome, considering only alphanumeric characters and ignoring case.',
        difficulty: 'Easy',
        companyTags: ['Microsoft', 'Meta'],
        hints: ['Clean the string first or skip non-alphanumeric characters on the fly.'],
        approach: 'Use two pointers to compare characters from both ends moving towards the center.',
        solution: 'def isPalindrome(s):\n    l, r = 0, len(s) - 1\n    while l < r:\n        if not s[l].isalnum(): l += 1\n        elif not s[r].isalnum(): r -= 1\n        elif s[l].lower() != s[r].lower(): return False\n        else:\n            l += 1\n            r -= 1\n    return True',
        complexity: {
          time: 'O(n)',
          space: 'O(1)'
        },
        sampleInput: 's = "A man, a plan, a canal: Panama"',
        sampleOutput: 'true',
        inputType: 'String',
        inputLength: '1 <= s.length <= 2 * 10^5',
        outputLength: '1 (boolean)'
      },
{
        patternId: 'two-pointers',
        id: 'container-with-most-water',
        title: 'Container With Most Water',
        statement: 'Find two lines that together with the x-axis form a container, such that the container contains the most water.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google'],
        hints: ['The width is determined by the distance between pointers; height is determined by the shorter line.'],
        approach: 'Use two pointers at the extremes. Move the pointer pointing to the shorter line to potentially find a taller line.',
        solution: 'def maxArea(height):\n    l, r = 0, len(height) - 1\n    max_area = 0\n    while l < r:\n        area = (r - l) * min(height[l], height[r])\n        max_area = max(max_area, area)\n        if height[l] < height[r]: l += 1\n        else: r -= 1\n    return max_area',
        complexity: {
          time: 'O(n)',
          space: 'O(1)'
        },
        sampleInput: 'height = [1,8,6,2,5,4,8,3,7]',
        sampleOutput: '49',
        inputType: 'Array of integers',
        inputLength: '2 <= height.length <= 10^5',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'sliding-window',
    name: '2. Sliding Window',
    description: 'Maintain a dynamic window of elements to track a specific property, avoiding nested loops.',
    recognitionClues: ['Contiguous Subarray', 'Substring', 'Max/Min of window', 'Variable window size'],
    template: 'for right in range(len(arr)):\n    # add right element\n    while window_invalid:\n        # remove left element\n        left += 1\n    # update result',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'sliding-window',
        id: 'longest-substring-no-repeat',
        title: 'Longest Substring Without Repeating Characters',
        statement: 'Find the length of the longest substring without repeating characters.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Meta'],
        hints: ['Use a map to store the last seen index of each character.'],
        approach: 'Expand the right pointer. If a character repeats, shift the left pointer to the right of the last occurrence.',
        solution: 'def lengthOfLongestSubstring(s):\n    used = {}\n    l, max_len = 0, 0\n    for r in range(len(s)):\n        if s[r] in used:\n            l = max(l, used[s[r]] + 1)\n        used[s[r]] = r\n        max_len = max(max_len, r - l + 1)\n    return max_len',
        complexity: {
          time: 'O(n)',
          space: 'O(min(m, n))'
        },
        sampleInput: 's = "abcabcbb"',
        sampleOutput: '3',
        inputType: 'String',
        inputLength: '0 <= s.length <= 5 * 10^4',
        outputLength: '1 (integer)'
      },
{
        patternId: 'sliding-window',
        id: 'min-window-substring',
        title: 'Minimum Window Substring',
        statement: 'Find the minimum window in s which contains all characters of t.',
        difficulty: 'Hard',
        companyTags: ['Google', 'Amazon'],
        hints: ['Use a frequency map for t and a sliding window for s.'],
        approach: 'Expand right until window is valid. Then shrink left as much as possible while keeping the window valid.',
        solution: 'from collections import Counter\n\ndef minWindow(s, t):\n    if not t or not s: return ""\n    dict_t = Counter(t)\n    required = len(dict_t)\n    l, r = 0, 0\n    formed = 0\n    window_counts = {}\n    ans = float("inf"), None, None\n    \n    while r < len(s):\n        char = s[r]\n        window_counts[char] = window_counts.get(char, 0) + 1\n        if char in dict_t and window_counts[char] == dict_t[char]:\n            formed += 1\n        while l <= r and formed == required:\n            char = s[l]\n            if r - l + 1 < ans[0]:\n                ans = (r - l + 1, l, r)\n            window_counts[char] -= 1\n            if char in dict_t and window_counts[char] < dict_t[char]:\n                formed -= 1\n            l += 1\n        r += 1\n    return "" if ans[0] == float("inf") else s[ans[1]:ans[2]+1]',
        complexity: {
          time: 'O(s+t)',
          space: 'O(s+t)'
        },
        sampleInput: 's = "ADOBECODEBANC", t = "ABC"',
        sampleOutput: '"BANC"',
        inputType: 'String, String',
        inputLength: '1 <= s.length, t.length <= 10^5',
        outputLength: 'Min window string length <= s.length'
      }
    ]
  },
{
    id: 'prefix-sum',
    name: '3. Prefix Sum',
    description: 'Pre-calculate the sum of elements from the start to each index to answer range queries in O(1).',
    recognitionClues: ['Range Sum', 'Subarray Sum', 'Cumulative Total'],
    template: 'prefix = [0] * (len(nums) + 1)\nfor i in range(len(nums)):\n    prefix[i+1] = prefix[i] + nums[i]',
    difficulty: 'Easy',
    problems: [
{
        patternId: 'prefix-sum',
        id: 'range-sum-query',
        title: 'Range Sum Query - Immutable',
        statement: 'Calculate the sum of elements between indices i and j inclusive.',
        difficulty: 'Easy',
        companyTags: ['LeetCode'],
        hints: ['Precompute the prefix sum array.'],
        approach: 'Sum(i, j) = Prefix[j+1] - Prefix[i].',
        solution: 'class NumArray:\n    def __init__(self, nums):\n        self.prefix = [0] * (len(nums) + 1)\n        for i in range(len(nums)):\n            self.prefix[i+1] = self.prefix[i] + nums[i]\n\n    def sumRange(self, left, right):\n        return self.prefix[right + 1] - self.prefix[left]',
        complexity: {
          time: 'O(1) query',
          space: 'O(n)'
        },
        sampleInput: 'nums = [-2, 0, 3, -5, 2, -1], sumRange(0, 2)',
        sampleOutput: '1',
        inputType: 'Array of integers, Indices (left, right)',
        inputLength: '1 <= nums.length <= 10^4',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'fast-slow-pointers',
    name: '4. Fast & Slow Pointers',
    description: 'Use two pointers moving at different speeds to detect cycles or find mid-points in linked lists.',
    recognitionClues: ['Cycle Detection', 'Linked List Middle', 'Happy Number'],
    template: 'slow, fast = head, head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow == fast: return True',
    difficulty: 'Easy',
    problems: [
{
        patternId: 'fast-slow-pointers',
        id: 'linked-list-cycle',
        title: 'Linked List Cycle',
        statement: 'Determine if a linked list has a cycle in it.',
        difficulty: 'Easy',
        companyTags: ['Microsoft', 'Amazon'],
        hints: ['If there is a cycle, the fast pointer will eventually catch the slow pointer.'],
        approach: 'Use Floyd\'s Cycle Finding Algorithm.',
        solution: 'def hasCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast: return True\n    return False',
        complexity: {
          time: 'O(n)',
          space: 'O(1)'
        },
        sampleInput: 'head = [3,2,0,-4], pos = 1',
        sampleOutput: 'true',
        inputType: 'Linked List',
        inputLength: '0 <= number of nodes <= 10^4',
        outputLength: '1 (boolean)'
      }
    ]
  },
{
    id: 'binary-search',
    name: '5. Binary Search',
    description: 'Efficiently locate an element in a sorted array by repeatedly halving the search interval.',
    recognitionClues: ['Sorted Array', 'Search Space', 'Minimize Maximum', 'Maximize Minimum'],
    template: 'while left <= right:\n    mid = (left + right) // 2\n    if arr[mid] == target: return mid\n    elif arr[mid] < target: left = mid + 1\n    else: right = mid - 1',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'binary-search',
        id: 'binary-search',
        title: 'Binary Search',
        statement: 'Given a sorted array and a target, return the index of the target if it exists.',
        difficulty: 'Easy',
        companyTags: ['LeetCode'],
        hints: ['Check the middle; eliminate half the remaining search space.'],
        approach: 'Standard binary search implementation.',
        solution: 'def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: l = mid + 1\n        else: r = mid - 1\n    return -1',
        complexity: {
          time: 'O(log n)',
          space: 'O(1)'
        },
        sampleInput: 'nums = [-1,0,3,5,9,12], target = 9',
        sampleOutput: '4',
        inputType: 'Array of integers (sorted), Integer',
        inputLength: '1 <= nums.length <= 10^4',
        outputLength: '1 (integer, index)'
      }
    ]
  },
{
    id: 'merge-intervals',
    name: '6. Merge Intervals',
    description: 'Handle overlapping intervals by sorting them and merging contiguous ranges.',
    recognitionClues: ['Overlapping Ranges', 'Scheduling', 'Intervals'],
    template: 'intervals.sort(key=lambda x: x[0])\nmerged = [intervals[0]]\nfor start, end in intervals[1:]:\n    if start <= merged[-1][1]:\n        merged[-1][1] = max(merged[-1][1], end)\n    else:\n        merged.append([start, end])',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'merge-intervals',
        id: 'merge-intervals',
        title: 'Merge Intervals',
        statement: 'Merge all overlapping intervals.',
        difficulty: 'Medium',
        companyTags: ['Google', 'Meta'],
        hints: ['Sort intervals by start time first.'],
        approach: 'Iterate through sorted intervals; if the current start is <= previous end, merge them.',
        solution: 'def merge(intervals):\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for interval in intervals:\n        if not merged or interval[0] > merged[-1][1]:\n            merged.append(interval)\n        else:\n            merged[-1][1] = max(merged[-1][1], interval[1])\n    return merged',
        complexity: {
          time: 'O(n log n)',
          space: 'O(n)'
        },
        sampleInput: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        sampleOutput: '[[1,6],[8,10],[15,18]]',
        inputType: '2D array of integers (intervals)',
        inputLength: '1 <= intervals.length <= 10^4',
        outputLength: 'Merged intervals <= intervals.length'
      }
    ]
  },
{
    id: 'cyclic-sort',
    name: '7. Cyclic Sort',
    description: 'Sort numbers in range [1, n] by placing each number at its correct index in O(n) time.',
    recognitionClues: ['Range 1 to N', 'Find Missing Number', 'Duplicates'],
    template: 'while i < len(nums):\n    correct = nums[i] - 1\n    if nums[i] != nums[correct]:\n        nums[i], nums[correct] = nums[correct], nums[i]\n    else:\n        i += 1',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'cyclic-sort',
        id: 'missing-number',
        title: 'Missing Number',
        statement: 'Find the one number in the range [0, n] that is missing from the array.',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Google'],
        hints: ['Try placing each number at its corresponding index.'],
        approach: 'Use cyclic sort to place numbers. The index where the number is missing is the answer.',
        solution: 'def missingNumber(nums):\n    i = 0\n    while i < len(nums):\n        correct = nums[i]\n        if nums[i] < len(nums) and nums[i] != nums[correct]:\n            nums[i], nums[correct] = nums[correct], nums[i]\n        else:\n            i += 1\n    for i in range(len(nums)):\n        if nums[i] != i: return i\n    return len(nums)',
        complexity: {
          time: 'O(n)',
          space: 'O(1)'
        },
        sampleInput: 'nums = [3,0,1]',
        sampleOutput: '2',
        inputType: 'Array of integers',
        inputLength: '1 <= nums.length <= 10^4',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'monotonic-stack',
    name: '8. Monotonic Stack',
    description: 'Use a stack to maintain elements in increasing or decreasing order to solve "next greater" problems.',
    recognitionClues: ['Next Greater Element', 'Daily Temperatures', 'Histogram'],
    template: 'stack = []\nfor x in arr:\n    while stack and stack[-1] < x:\n        val = stack.pop()\n        # process val\n    stack.append(x)',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'monotonic-stack',
        id: 'daily-temperatures',
        title: 'Daily Temperatures',
        statement: 'Given an array of temperatures, return an array such that wait[i] is the number of days to wait for a warmer temperature.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Meta'],
        hints: ['Use a stack to keep track of indices of temperatures that haven\'t found a warmer day yet.'],
        approach: 'Iterate through temperatures. While the current temp is warmer than the temp at the stack top, pop the stack and calculate the distance.',
        solution: 'def dailyTemperatures(temperatures):\n    res = [0] * len(temperatures)\n    stack = []\n    for i, temp in enumerate(temperatures):\n        while stack and temp > temperatures[stack[-1]]:\n            idx = stack.pop()\n            res[idx] = i - idx\n        stack.append(i)\n    return res',
        complexity: {
          time: 'O(n)',
          space: 'O(n)'
        },
        sampleInput: 'temperatures = [73,74,75,71,69,72,76,73]',
        sampleOutput: '[1,1,4,2,1,1,0,0]',
        inputType: 'Array of integers',
        inputLength: '1 <= temperatures.length <= 10^5',
        outputLength: 'Same as input length'
      }
    ]
  },
{
    id: 'top-k-elements',
    name: '9. Top K Elements (Heap)',
    description: 'Use a Min-Heap or Max-Heap to find the k largest or smallest elements in a collection.',
    recognitionClues: ['Top K', 'K-th Largest', 'Most Frequent'],
    template: 'import heapq\nheap = []\nfor x in arr:\n    heapq.heappush(heap, x)\n    if len(heap) > k: heapq.heappop(heap)',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'top-k-elements',
        id: 'kth-largest-element',
        title: 'Kth Largest Element in an Array',
        statement: 'Find the kth largest element in an unsorted array.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google'],
        hints: ['A min-heap of size k will always have the kth largest element at the top.'],
        approach: 'Maintain a min-heap of size k. If the current element is larger than the heap top, replace the top.',
        solution: 'import heapq\n\ndef findKthLargest(nums, k):\n    heap = []\n    for num in nums:\n        heapq.heappush(heap, num)\n        if len(heap) > k:\n            heapq.heappop(heap)\n    return heap[0]',
        complexity: {
          time: 'O(n log k)',
          space: 'O(k)'
        },
        sampleInput: 'nums = [3,2,1,5,6,4], k = 2',
        sampleOutput: '5',
        inputType: 'Array of integers, Integer',
        inputLength: '1 <= nums.length <= 10^5',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'bfs',
    name: '10. Breadth First Search (BFS)',
    description: 'Traverse graphs or trees level by level to find the shortest path in unweighted graphs.',
    recognitionClues: ['Level Order', 'Shortest Path', 'Minimum Steps'],
    template: 'queue = collections.deque([root])\nwhile queue:\n    level_size = len(queue)\n    for _ in range(level_size):\n        node = queue.popleft()\n        # process node\n        # queue.append(children)',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'bfs',
        id: 'binary-tree-level-order',
        title: 'Binary Tree Level Order Traversal',
        statement: 'Return the level order traversal of a binary tree.',
        difficulty: 'Easy',
        companyTags: ['Meta', 'Amazon'],
        hints: ['Use a queue to keep track of nodes at each level.'],
        approach: 'Standard BFS: process current level, then enqueue children of current level.',
        solution: 'from collections import deque\n\ndef levelOrder(root):\n    if not root: return []\n    res, queue = [], deque([root])\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            node = queue.popleft()\n            level.append(node.val)\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n        res.append(level)\n    return res',
        complexity: {
          time: 'O(n)',
          space: 'O(n)'
        },
        sampleInput: 'root = [3,9,20,null,null,15,7]',
        sampleOutput: '[[3],[9,20],[15,7]]',
        inputType: 'Binary Tree',
        inputLength: '0 <= number of nodes <= 2000',
        outputLength: 'Number of levels in the tree'
      }
    ]
  },
{
    id: 'dfs-backtracking',
    name: '11. DFS + Backtracking',
    description: 'Explore all possible paths by diving deep into one branch and backtracking when a dead end is hit.',
    recognitionClues: ['All Combinations', 'Permutations', 'Subsets', 'Puzzle solving'],
    template: 'def backtrack(path, options):\n    if is_solution(path):\n        res.append(path[:])\n        return\n    for opt in options:\n        path.append(opt)\n        backtrack(path, options - {opt})\n        path.pop()',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'dfs-backtracking',
        id: 'subsets',
        title: 'Subsets',
        statement: 'Given a set of distinct integers, return all possible subsets (the power set).',
        difficulty: 'Medium',
        companyTags: ['Google', 'Amazon'],
        hints: ['At each step, you can either include the element or not.'],
        approach: 'Recursive backtracking to explore all combinations.',
        solution: 'def subsets(nums):\n    res = []\n    def backtrack(start, path):\n        res.append(path[:])\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(0, [])\n    return res',
        complexity: {
          time: 'O(n * 2^n)',
          space: 'O(n)'
        },
        sampleInput: 'nums = [1,2,3]',
        sampleOutput: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]',
        inputType: 'Array of distinct integers',
        inputLength: '1 <= nums.length <= 10',
        outputLength: '2^nums.length (number of subsets)'
      }
    ]
  },
{
    id: 'trie',
    name: '12. Trie (Prefix Tree)',
    description: 'Store strings in a tree structure where each node represents a character, optimized for prefix lookups.',
    recognitionClues: ['Prefix Matching', 'Dictionary', 'Auto-complete'],
    template: 'class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.isEnd = False',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'trie',
        id: 'implement-trie',
        title: 'Implement Trie (Prefix Tree)',
        statement: 'Implement a trie with insert, search, and startsWith methods.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google'],
        hints: ['Each node should store a map of characters to child nodes.'],
        approach: 'Standard Trie implementation with child mapping.',
        solution: 'class Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word):\n        node = self.root\n        for char in word:\n            if char not in node.children: node.children[char] = TrieNode()\n            node = node.children[char]\n        node.isEnd = True\n\n    def search(self, word):\n        node = self.root\n        for char in word:\n            if char not in node.children: return False\n            node = node.children[char]\n        return node.isEnd\n\n    def startsWith(self, prefix):\n        node = self.root\n        for char in prefix:\n            if char not in node.children: return False\n            node = node.children[char]\n        return True',
        complexity: {
          time: 'O(L) per operation',
          space: 'O(AL)'
        },
        sampleInput: 'insert("apple"), search("apple"), startsWith("app")',
        sampleOutput: 'null, true, true',
        inputType: 'String',
        inputLength: '1 <= word.length <= 2000',
        outputLength: 'Varies (void/boolean)'
      }
    ]
  },
{
    id: 'union-find',
    name: '13. Union Find',
    description: 'Keep track of connected components in a graph using disjoint set unions.',
    recognitionClues: ['Connected Components', 'Dynamic Connectivity', 'Network Paths'],
    template: 'def find(i):\n    if parent[i] == i: return i\n    parent[i] = find(parent[i])\n    return parent[i]\n\ndef union(i, j):\n    root_i, root_j = find(i), find(j)\n    if root_i != root_j: parent[root_i] = root_j',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'union-find',
        id: 'number-of-provinces',
        title: 'Number of Provinces',
        statement: 'Find the total number of connected components in a graph.',
        difficulty: 'Medium',
        companyTags: ['Microsoft', 'Amazon'],
        hints: ['Union-find is perfect for counting distinct sets.'],
        approach: 'Iterate through all pairs. If they are connected, union them. The number of unique roots is the answer.',
        solution: 'class UnionFind:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.count = n\n\n    def find(self, i):\n        if self.parent[i] == i: return i\n        self.parent[i] = self.find(self.parent[i])\n        return self.parent[i]\n\n    def union(self, i, j):\n        root_i, root_j = self.find(i), self.find(j)\n        if root_i != root_j:\n            self.parent[root_i] = root_j\n            self.count -= 1\n\ndef findCircleNum(isConnected):\n    n = len(isConnected)\n    uf = UnionFind(n)\n    for i in range(n):\n        for j in range(i + 1, n):\n            if isConnected[i][j]: uf.union(i, j)\n    return uf.count',
        complexity: {
          time: 'O(n^2 alpha(n))',
          space: 'O(n)'
        },
        sampleInput: 'isConnected = [[1,1,0],[1,1,0],[0,0,1]]',
        sampleOutput: '2',
        inputType: '2D array representing adjacency matrix',
        inputLength: '1 <= n <= 200',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'topological-sort',
    name: '14. Topological Sort',
    description: 'Linear ordering of vertices such that for every edge u->v, u comes before v. Used for dependencies.',
    recognitionClues: ['Course Schedule', 'Dependency Ordering', 'DAG'],
    template: 'queue = collections.deque([nodes with 0 in-degree])\nwhile queue:\n    u = queue.popleft()\n    for v in adj[u]:\n        in_degree[v] -= 1\n        if in_degree[v] == 0: queue.append(v)',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'topological-sort',
        id: 'course-schedule',
        title: 'Course Schedule',
        statement: 'Determine if you can finish all courses given their prerequisites.',
        difficulty: 'Medium',
        companyTags: ['Google', 'Amazon'],
        hints: ['Use Kahn\'s Algorithm or DFS to detect cycles in a DAG.'],
        approach: 'Compute in-degrees of all nodes. Use a queue to process nodes with 0 in-degree. If the processed count equals total nodes, it\'s a DAG.',
        solution: 'from collections import deque, defaultdict\n\ndef canFinish(numCourses, prerequisites):\n    adj = defaultdict(list)\n    in_degree = [0] * numCourses\n    for dest, src in prerequisites:\n        adj[src].append(dest)\n        in_degree[dest] += 1\n    \n    queue = deque([i for i in range(numCourses) if in_degree[i] == 0])\n    count = 0\n    while queue:\n        u = queue.popleft()\n        count += 1\n        for v in adj[u]:\n            in_degree[v] -= 1\n            if in_degree[v] == 0: queue.append(v)\n    return count == numCourses',
        complexity: {
          time: 'O(V + E)',
          space: 'O(V + E)'
        },
        sampleInput: 'numCourses = 2, prerequisites = [[1,0]]',
        sampleOutput: 'true',
        inputType: 'Integer, 2D array of prerequisites',
        inputLength: '1 <= numCourses <= 2000',
        outputLength: '1 (boolean)'
      }
    ]
  },
{
    id: 'dp-1d',
    name: '15. Dynamic Programming 1D',
    description: 'Solve complex problems by breaking them into simpler subproblems and storing results to avoid redundant work.',
    recognitionClues: ['Optimal Substructure', 'Overlapping Subproblems', 'Max/Min Value', 'Number of Ways'],
    template: 'dp = [0] * (n + 1)\nfor i in range(1, n + 1):\n    dp[i] = min(dp[i-1], dp[i-2]) + cost[i]',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'dp-1d',
        id: 'climbing-stairs',
        title: 'Climbing Stairs',
        statement: 'Find the number of distinct ways to climb n stairs, taking 1 or 2 steps at a time.',
        difficulty: 'Easy',
        companyTags: ['Amazon', 'Microsoft'],
        hints: ['The number of ways to reach step n is the sum of ways to reach n-1 and n-2.'],
        approach: 'Use a 1D array to store the number of ways to reach each step.',
        solution: 'def climbStairs(n):\n    if n <= 2: return n\n    dp = [0] * (n + 1)\n    dp[1], dp[2] = 1, 2\n    for i in range(3, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    return dp[n]',
        complexity: {
          time: 'O(n)',
          space: 'O(n)'
        },
        sampleInput: 'n = 3',
        sampleOutput: '3',
        inputType: 'Integer',
        inputLength: '1 <= n <= 45',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'dp-2d-grid',
    name: '16. Dynamic Programming 2D Grid',
    description: 'Solve problems involving a grid by building a 2D table of optimal solutions.',
    recognitionClues: ['Matrix Paths', 'Grid Optimization', 'Unique Paths'],
    template: 'dp = [[0]*cols for _ in range(rows)]\nfor i in range(rows):\n    for j in range(cols):\n        dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + cost[i][j]',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'dp-2d-grid',
        id: 'unique-paths',
        title: 'Unique Paths',
        statement: 'Find the number of possible unique paths from the top-left to the bottom-right of a grid.',
        difficulty: 'Medium',
        companyTags: ['Google', 'Amazon'],
        hints: ['A cell (i, j) can only be reached from (i-1, j) or (i, j-1).'],
        approach: 'Use a 2D DP table where each cell stores the number of ways to reach it.',
        solution: 'def uniquePaths(m, n):\n    dp = [[1] * n for _ in range(m)]\n    for i in range(1, m):\n        for j in range(1, n):\n            dp[i][j] = dp[i-1][j] + dp[i][j-1]\n    return dp[m-1][n-1]',
        complexity: {
          time: 'O(m * n)',
          space: 'O(m * n)'
        },
        sampleInput: 'm = 3, n = 7',
        sampleOutput: '28',
        inputType: 'Integer, Integer',
        inputLength: '1 <= m, n <= 100',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'knapsack',
    name: '17. Knapsack Variants',
    description: 'Decide whether to include or exclude an item to maximize value without exceeding capacity.',
    recognitionClues: ['Include/Exclude', 'Target Sum', 'Maximum Value with Constraint'],
    template: 'for item in items:\n    for w in range(capacity, item_weight - 1, -1):\n        dp[w] = max(dp[w], dp[w - item_weight] + item_value)',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'knapsack',
        id: 'partition-equal-subset-sum',
        title: 'Partition Equal Subset Sum',
        statement: 'Determine if an array can be partitioned into two subsets such that the sum of elements in both subsets is equal.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Meta'],
        hints: ['This is a 0/1 Knapsack problem where the target sum is total_sum / 2.'],
        approach: 'Use a boolean DP array to track all possible sums that can be formed.',
        solution: 'def canPartition(nums):\n    total = sum(nums)\n    if total % 2 != 0: return False\n    target = total // 2\n    dp = [False] * (target + 1)\n    dp[0] = True\n    for num in nums:\n        for i in range(target, num - 1, -1):\n            dp[i] = dp[i] or dp[i - num]\n    return dp[target]',
        complexity: {
          time: 'O(n * target)',
          space: 'O(target)'
        },
        sampleInput: 'nums = [1,5,11,5]',
        sampleOutput: 'true',
        inputType: 'Array of integers',
        inputLength: '1 <= nums.length <= 200',
        outputLength: '1 (boolean)'
      }
    ]
  },
{
    id: 'subsequence-dp',
    name: '18. Subsequence DP (LCS/LIS)',
    description: 'Find the longest common or increasing subsequence using DP to compare two sequences.',
    recognitionClues: ['Common Subsequence', 'Increasing Sequence', 'Edit Distance'],
    template: 'for i in range(n):\n    for j in range(m):\n        if s1[i] == s2[j]:\n            dp[i+1][j+1] = dp[i][j] + 1\n        else:\n            dp[i+1][j+1] = max(dp[i][j+1], dp[i+1][j])',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'subsequence-dp',
        id: 'longest-common-subsequence',
        title: 'Longest Common Subsequence',
        statement: 'Find the length of the longest common subsequence between two strings.',
        difficulty: 'Medium',
        companyTags: ['Google', 'Microsoft'],
        hints: ['If chars match, it is 1 + LCS of remaining. If not, take max of skipping one char from either string.'],
        approach: 'Use a 2D DP table to store LCS lengths for all prefix combinations.',
        solution: 'def longestCommonSubsequence(text1, text2):\n    m, n = len(text1), len(text2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(m):\n        for j in range(n):\n            if text1[i] == text2[j]:\n                dp[i+1][j+1] = dp[i][j] + 1\n            else:\n                dp[i+1][j+1] = max(dp[i][j+1], dp[i+1][j])\n    return dp[m][n]',
        complexity: {
          time: 'O(m * n)',
          space: 'O(m * n)'
        },
        sampleInput: 'text1 = "abcde", text2 = "ace"',
        sampleOutput: '3',
        inputType: 'String, String',
        inputLength: '1 <= text1.length, text2.length <= 1000',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'interval-dp',
    name: '19. Interval DP',
    description: 'Solve problems over a range [i, j] by considering all possible split points k.',
    recognitionClues: ['Optimal Range', 'Merge Process', 'Palindromic Partitioning'],
    template: 'for length in range(1, n + 1):\n    for i in range(n - length + 1):\n        j = i + length - 1\n        for k in range(i, j):\n            dp[i][j] = min(dp[i][j], dp[i][k] + dp[k+1][j] + cost)',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'interval-dp',
        id: 'burst-balloons',
        title: 'Burst Balloons',
        statement: 'Find the maximum coins you can collect by bursting balloons in a specific order.',
        difficulty: 'Hard',
        companyTags: ['Google'],
        hints: ['Think about which balloon is the LAST to be burst in a range [i, j].'],
        approach: 'Use DP to calculate the max coins for each interval, considering all possible last balloons.',
        solution: 'def maxCoins(nums):\n    nums = [1] + nums + [1]\n    n = len(nums)\n    dp = [[0] * n for _ in range(n)]\n    for length in range(1, n - 2):\n        for left in range(1, n - length):\n            right = left + length\n            for i in range(left, right):\n                score = nums[left-1] * nums[i] * nums[right+1]\n                dp[left][right] = max(dp[left][right], dp[left][i-1] + score + dp[i+1][right])\n    return dp[1][n-2]',
        complexity: {
          time: 'O(n^3)',
          space: 'O(n^2)'
        },
        sampleInput: 'nums = [3,1,5,8]',
        sampleOutput: '167',
        inputType: 'Array of integers',
        inputLength: '1 <= nums.length <= 300',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'dp-on-trees',
    name: '20. DP on Trees',
    description: 'Solve problems on trees by computing optimal states for each node based on its children.',
    recognitionClues: ['Tree Diameter', 'Maximum Path Sum', 'Independent Set on Tree'],
    template: 'def solve(u, p):\n    for v in adj[u]:\n        if v != p: solve(v, u)\n    dp[u] = max(dp[v] for v in children)',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'dp-on-trees',
        id: 'house-robber-iii',
        title: 'House Robber III',
        statement: 'Find the maximum money you can rob from a binary tree of houses without robbing two adjacent houses.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Meta'],
        hints: ['Each node can either be robbed or not.'],
        approach: 'Return a pair [robbed, not_robbed] for each subtree and calculate total based on child states.',
        solution: 'def rob(root):\n    def dfs(node):\n        if not node: return [0, 0]\n        left = dfs(node.left)\n        right = dfs(node.right)\n        # Rob this node: cannot rob children\n        rob_this = node.val + left[1] + right[1]\n        # Don\'t rob: can rob or not rob children\n        not_rob = max(left) + max(right)\n        return [rob_this, not_rob]\n    return max(dfs(root))',
        complexity: {
          time: 'O(n)',
          space: 'O(h)'
        },
        sampleInput: 'root = [3,2,3,null,3,null,1]',
        sampleOutput: '7',
        inputType: 'Binary Tree',
        inputLength: '1 <= number of nodes <= 10^4',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'bit-manipulation',
    name: '21. Bit Manipulation',
    description: 'Operate on individual bits of integers to solve problems with constant space and high performance.',
    recognitionClues: ['XOR tricks', 'Power of Two', 'Bitmasks', 'Counting Bits'],
    template: 'if (n & (n - 1)) == 0: # Power of 2\nres ^= x # XOR',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'bit-manipulation',
        id: 'single-number',
        title: 'Single Number',
        statement: 'Find the element that appears once in an array where every other element appears twice.',
        difficulty: 'Easy',
        companyTags: ['Google', 'Microsoft'],
        hints: ['XORing a number with itself results in 0.'],
        approach: 'XOR all elements in the array. The remaining value is the single number.',
        solution: 'def singleNumber(nums):\n    res = 0\n    for n in nums: res ^= n\n    return res',
        complexity: {
          time: 'O(n)',
          space: 'O(1)'
        },
        sampleInput: 'nums = [2,2,1]',
        sampleOutput: '1',
        inputType: 'Array of integers',
        inputLength: '1 <= nums.length <= 3 * 10^4',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'math-number-theory',
    name: '22. Math & Number Theory',
    description: 'Use mathematical properties like GCD, primes, and modulo to optimize computations.',
    recognitionClues: ['Prime Numbers', 'GCD', 'Divisibility', 'Fast Exponentiation'],
    template: 'def gcd(a, b):\n    while b:\n        a, b = b, a % b\n    return a',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'math-number-theory',
        id: 'pow-x-n',
        title: 'Pow(x, n)',
        statement: 'Implement pow(x, n), which calculates x raised to the power n.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google'],
        hints: ['Use binary exponentiation.'],
        approach: 'Divide and conquer: x^n = (x^(n/2))^2 if n is even.',
        solution: 'def myPow(x, n):\n    if n < 0:\n        x = 1 / x\n        n = -n\n    res = 1\n    while n:\n        if n % 2:\n            res *= x\n        x *= x\n        n //= 2\n    return res',
        complexity: {
          time: 'O(log n)',
          space: 'O(1)'
        },
        sampleInput: 'x = 2.00000, n = 10',
        sampleOutput: '1024.00000',
        inputType: 'Float, Integer',
        inputLength: '-100.0 < x < 100.0, -2^31 <= n <= 2^31 - 1',
        outputLength: '1 (float)'
      }
    ]
  },
{
    id: 'greedy',
    name: '23. Greedy Algorithms',
    description: 'Make the locally optimal choice at each step with the hope of finding the global optimum.',
    recognitionClues: ['Interval Scheduling', 'Local Optimum', 'Min/Max Coins'],
    template: 'res = 0\nfor x in sorted(arr):\n    if condition(x): res += 1',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'greedy',
        id: 'jump-game',
        title: 'Jump Game',
        statement: 'Determine if you can reach the last index of an array given jump lengths.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google'],
        hints: ['Keep track of the furthest reachable index.'],
        approach: 'Maintain a variable `max_reach`. If current index is > max_reach, you can\'t move further.',
        solution: 'def canJump(nums):\n    max_reach = 0\n    for i, jump in enumerate(nums):\n        if i > max_reach: return False\n        max_reach = max(max_reach, i + jump)\n    return True',
        complexity: {
          time: 'O(n)',
          space: 'O(1)'
        },
        sampleInput: 'nums = [2,3,1,1,4]',
        sampleOutput: 'true',
        inputType: 'Array of integers',
        inputLength: '1 <= nums.length <= 10^4',
        outputLength: '1 (boolean)'
      }
    ]
  },
{
    id: 'monotonic-deque',
    name: '24. Monotonic Deque',
    description: 'Maintain a deque of indices where elements are in sorted order, used for sliding window extremes.',
    recognitionClues: ['Sliding Window Maximum', 'Window Optimization'],
    template: 'while deque and arr[deque[-1]] < x:\n    deque.pop()\ndeque.append(i)',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'monotonic-deque',
        id: 'sliding-window-maximum',
        title: 'Sliding Window Maximum',
        statement: 'Return the maximum element in each sliding window of size k.',
        difficulty: 'Hard',
        companyTags: ['Google', 'Amazon'],
        hints: ['Use a deque to store indices of elements in decreasing order of value.'],
        approach: 'As the window slides, pop elements from the back of the deque if they are smaller than the current element. Pop from front if they are outside the window.',
        solution: 'from collections import deque\n\ndef maxSlidingWindow(nums, k):\n    res = []\n    q = deque()\n    for i, n in enumerate(nums):\n        while q and nums[q[-1]] < n:\n            q.pop()\n        q.append(i)\n        if q[0] == i - k: q.popleft()\n        if i >= k - 1: res.append(nums[q[0]])\n    return res',
        complexity: {
          time: 'O(n)',
          space: 'O(k)'
        },
        sampleInput: 'nums = [1,3,-1,-3,5,3,6,7], k = 3',
        sampleOutput: '[3,3,5,5,6,7]',
        inputType: 'Array of integers, Integer',
        inputLength: '1 <= nums.length <= 10^5',
        outputLength: 'nums.length - k + 1'
      }
    ]
  },
{
    id: 'k-way-merge',
    name: '25. K-Way Merge',
    description: 'Merge multiple sorted sequences into a single sorted sequence using a priority queue.',
    recognitionClues: ['Merge Sorted Lists', 'Smallest Range'],
    template: 'pq = [(list[0], list_idx) for list in lists]\nwhile pq:\n    val, idx = heapq.heappop(pq)\n    # process val\n    # push next from list[idx]',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'k-way-merge',
        id: 'merge-k-sorted-lists',
        title: 'Merge K Sorted Lists',
        statement: 'Merge k sorted linked lists and return it as one sorted list.',
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Google'],
        hints: ['A Min-Heap of size k can efficiently find the minimum element across all lists.'],
        approach: 'Push the head of each list into a min-heap. Pop the smallest, and push the next element from the same list.',
        solution: 'import heapq\n\ndef mergeKLists(lists):\n    heap = []\n    for i, l in enumerate(lists):\n        if l: heapq.heappush(heap, (l.val, i, l))\n    \n    dummy = ListNode(0)\n    curr = dummy\n    while heap:\n        val, i, node = heapq.heappop(heap)\n        curr.next = ListNode(val)\n        curr = curr.next\n        if node.next:\n            heapq.heappush(heap, (node.next.val, i, node.next))\n    return dummy.next',
        complexity: {
          time: 'O(N log K)',
          space: 'O(K)'
        },
        sampleInput: 'lists = [[1,4,5],[1,3,4],[2,6]]',
        sampleOutput: '[1,1,2,3,4,4,5,6]',
        inputType: 'Array of Linked Lists',
        inputLength: '0 <= lists.length <= 10^4',
        outputLength: 'Total number of nodes across all lists'
      }
    ]
  },
{
    id: 'bst-patterns',
    name: '26. BST Patterns',
    description: 'Leverage the ordered property of Binary Search Trees (Left < Root < Right).',
    recognitionClues: ['Ordered Tree', 'In-order Traversal', 'LCA'],
    template: 'def search(node, target):\n    if not node: return None\n    if target < node.val: return search(node.left, target)\n    if target > node.val: return search(node.right, target)\n    return node',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'bst-patterns',
        id: 'validate-bst',
        title: 'Validate Binary Search Tree',
        statement: 'Given a root node, determine if it is a valid binary search tree.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Meta'],
        hints: ['Every node must be within a specific range (min, max).'],
        approach: 'Use recursion to pass the allowable range down the tree.',
        solution: 'def isValidBST(root):\n    def validate(node, low, high):\n        if not node: return True\n        if not (low < node.val < high): return False\n        return validate(node.left, low, node.val) and validate(node.right, node.val, high)\n    return validate(root, float("-inf"), float("inf"))',
        complexity: {
          time: 'O(n)',
          space: 'O(h)'
        },
        sampleInput: 'root = [2,1,3]',
        sampleOutput: 'true',
        inputType: 'Binary Tree',
        inputLength: '1 <= number of nodes <= 10^4',
        outputLength: '1 (boolean)'
      }
    ]
  },
{
    id: 'tree-traversals',
    name: '27. Tree Traversals',
    description: 'Systematically visit every node in a tree using Pre-order, In-order, or Post-order traversal.',
    recognitionClues: ['Hierarchical Data', 'Depth First Search', 'Tree Properties'],
    template: 'def inorder(node):\n    if node:\n        inorder(node.left)\n        visit(node)\n        inorder(node.right)',
    difficulty: 'Easy',
    problems: [
{
        patternId: 'tree-traversals',
        id: 'invert-binary-tree',
        title: 'Invert Binary Tree',
        statement: 'Flip a binary tree so that the left and right children of all nodes are swapped.',
        difficulty: 'Easy',
        companyTags: ['Google', 'Amazon'],
        hints: ['Post-order traversal: flip the children first, then the root.'],
        approach: 'Recursive approach: swap node.left and node.right, then recurse on both.',
        solution: 'def invertTree(root):\n    if not root: return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root',
        complexity: {
          time: 'O(n)',
          space: 'O(h)'
        },
        sampleInput: 'root = [4,2,7,1,3,6,9]',
        sampleOutput: '[4,7,2,9,6,3,1]',
        inputType: 'Binary Tree',
        inputLength: '0 <= number of nodes <= 100',
        outputLength: 'Same as input node count'
      }
    ]
  },
{
    id: 'backtracking-combinations',
    name: '28. Combinations & Permutations',
    description: 'Generate all possible arrangements or selections of elements from a set.',
    recognitionClues: ['Generate All', 'Combinations', 'Permutations'],
    template: 'def backtrack(curr, options):\n    if len(curr) == k: res.append(curr[:]); return\n    for i in range(start, len(options)):\n        curr.append(options[i])\n        backtrack(curr, options, i+1)\n        curr.pop()',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'backtracking-combinations',
        id: 'permutations',
        title: 'Permutations',
        statement: 'Given an array of distinct integers, return all possible permutations.',
        difficulty: 'Medium',
        companyTags: ['Meta', 'Amazon'],
        hints: ['Swap elements or use a visited array to build sequences.'],
        approach: 'Recursive backtracking to build a sequence and pop back once the size matches the input.',
        solution: 'def permute(nums):\n    res = []\n    def backtrack(path, used):\n        if len(path) == len(nums):\n            res.append(path[:])\n            return\n        for i in range(len(nums)):\n            if not used[i]:\n                used[i] = True\n                path.append(nums[i])\n                backtrack(path, used)\n                path.pop()\n                used[i] = False\n    backtrack([], [False]*len(nums))\n    return res',
        complexity: {
          time: 'O(n * n!)',
          space: 'O(n)'
        },
        sampleInput: 'nums = [1,2,3]',
        sampleOutput: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]',
        inputType: 'Array of distinct integers',
        inputLength: '1 <= nums.length <= 6',
        outputLength: 'n! (factorial of nums.length)'
      }
    ]
  },
{
    id: 'binary-search-answer',
    name: '29. Binary Search on Answer',
    description: 'Search for the optimal value of a result within a range, using a feasibility check to prune the space.',
    recognitionClues: ['Minimize Maximum', 'Maximize Minimum', 'Feasibility function'],
    template: 'while left <= right:\n    mid = (left + right) // 2\n    if can_do(mid): \n        res = mid\n        right = mid - 1 # try to find smaller\n    else: left = mid + 1',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'binary-search-answer',
        id: 'koko-eating-bananas',
        title: 'Koko Eating Bananas',
        statement: 'Find the minimum integer k such that Koko can eat all bananas within h hours.',
        difficulty: 'Medium',
        companyTags: ['Google', 'Amazon'],
        hints: ['The search space for k is between 1 and max(piles).'],
        approach: 'Binary search on the range of possible eating speeds. Check if speed k is feasible in h hours.',
        solution: 'import math\n\ndef minEatingSpeed(piles, h):\n    l, r = 1, max(piles)\n    res = r\n    while l <= r:\n        mid = (l + r) // 2\n        hours = sum(math.ceil(p / mid) for p in piles)\n        if hours <= h:\n            res = mid\n            r = mid - 1\n        else:\n            l = mid + 1\n    return res',
        complexity: {
          time: 'O(n log m)',
          space: 'O(1)'
        },
        sampleInput: 'piles = [3,6,7,11], h = 8',
        sampleOutput: '4',
        inputType: 'Array of integers, Integer',
        inputLength: '1 <= piles.length <= 10^4',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'monotonic-deque-opt',
    name: '30. Advanced Monotonic Deque',
    description: 'Optimize sliding window range queries for both minimums and maximums.',
    recognitionClues: ['Shortest Subarray with Sum', 'Min/Max over range', 'Sliding Window Max/Min', 'Shortest Subarray', 'Symmetric Windows', 'Dynamic Ranges'],
    template: 'deque = collections.deque()\nwhile deque and arr[deque[-1]] > x:\n    deque.pop()\ndeque.append(i)',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'monotonic-deque-opt',
        id: 'shortest-subarray-sum',
        title: 'Shortest Subarray with Sum at Least K',
        statement: 'Find the shortest non-empty subarray with sum at least k.',
        difficulty: 'Hard',
        companyTags: ['Google'],
        hints: ['Use a prefix sum array and a monotonic deque to find the smallest j-i.'],
        approach: 'Maintain a deque of prefix sums that are strictly increasing to optimize the distance search.',
        solution: 'from collections import deque\n\ndef shortestSubarray(nums, k):\n    n = len(nums)\n    prefix = [0] * (n + 1)\n    for i in range(n): prefix[i+1] = prefix[i] + nums[i]\n    \n    res = float("inf")\n    q = deque()\n    for i in range(n + 1):\n        while q and prefix[i] - prefix[q[0]] >= k:\n            res = min(res, i - q.popleft())\n        while q and prefix[i] <= prefix[q[-1]]:\n            q.pop()\n        q.append(i)\n    return res if res != float("inf") else -1',
        complexity: {
          time: 'O(n)',
          space: 'O(n)'
        },
        sampleInput: 'nums = [2,-1,2], k = 3',
        sampleOutput: '3',
        inputType: 'Array of integers, Integer',
        inputLength: '1 <= nums.length <= 10^5',
        outputLength: '1 (integer)'
      },
{
        patternId: 'monotonic-deque-opt',
        id: 'sliding-window-max-min',
        title: 'Sliding Window Maximum and Minimum',
        statement: 'Find both max and min for each sliding window of size k.',
        difficulty: 'Hard',
        companyTags: ['Google'],
        hints: ['Use two separate monotonic deques: one for max and one for min.'],
        approach: 'Maintain a decreasing deque for max and an increasing deque for min.',
        solution: 'from collections import deque\n\ndef slidingWindowMaxMin(nums, k):\n    max_dq, min_dq = deque(), deque()\n    res_max, res_min = [], []\n    for i, n in enumerate(nums):\n        while max_dq and nums[max_dq[-1]] < n: max_dq.pop()\n        while min_dq and nums[min_dq[-1]] > n: min_dq.pop()\n        max_dq.append(i)\n        min_dq.append(i)\n        if max_dq[0] == i - k: max_dq.popleft()\n        if min_dq[0] == i - k: min_dq.popleft()\n        if i >= k - 1:\n            res_max.append(nums[max_dq[0]])\n            res_min.append(nums[min_dq[0]])\n    return res_max, res_min',
        complexity: {
          time: 'O(n)',
          space: 'O(k)'
        },
        sampleInput: 'nums = [1,3,-1,-3,5,3,6,7], k = 3',
        sampleOutput: '([3,3,5,5,6,7], [-1,-3,-3,-3,3,3])',
        inputType: 'Array of integers, Integer',
        inputLength: '1 <= nums.length <= 10^5',
        outputLength: '2 arrays of size nums.length - k + 1'
      },
{
        patternId: 'monotonic-deque-opt',
        id: 'sliding-window-median',
        title: 'Sliding Window Median',
        statement: 'Find the median of all sliding windows of size k.',
        difficulty: 'Hard',
        companyTags: ['Google'],
        hints: ['Maintain two heaps (min and max) to keep the median at the top.'],
        approach: 'Use a dual-heap system. Balance the heaps such that the max-heap stores the smaller half and the min-heap stores the larger half.',
        solution: 'import heapq\n\ndef medianSlidingWindow(nums, k):\n    # implementation of dual-heap sliding window median\n    # complex logic involving lazy removal from heaps\n    pass',
        complexity: {
          time: 'O(n log k)',
          space: 'O(k)'
        },
        sampleInput: 'nums = [1,3,-1,-3,5,3,6,7], k = 3',
        sampleOutput: '[1.00000,-1.00000,-1.00000,3.00000,5.00000,6.00000]',
        inputType: 'Array of integers, Integer',
        inputLength: '1 <= nums.length <= 5 * 10^4',
        outputLength: 'nums.length - k + 1'
      }
    ]
  },
{
    id: 'k-way-merge-opt',
    name: '31. K-Way Merge Advanced',
    description: 'Merge complex sorted data streams or priority-based scheduling.',
    recognitionClues: ['Smallest Range Covering K Lists', 'Stream Merging', 'Skewed Streams', 'Priority Merge'],
    template: 'pq = [(list[0], list_idx)]\nwhile pq:\n    val, idx = heapq.heappop(pq)\n    # process val\n    # push next from list[idx]',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'k-way-merge-opt',
        id: 'smallest-range-k-lists',
        title: 'Smallest Range Covering Elements from K Lists',
        statement: 'Find the smallest range that includes at least one number from each of the k lists.',
        difficulty: 'Hard',
        companyTags: ['Google', 'Meta'],
        hints: ['Use a min-heap to track the current minimum across all lists.'],
        approach: 'Maintain a heap of the current elements from each list. The range is (max_element - heap_min). Update max and pop min.',
        solution: 'import heapq\n\ndef smallestRange(nums):\n    pq = []\n    max_val = -float("inf")\n    for i in range(len(nums)):\n        heapq.heappush(pq, (nums[i][0], i, 0))\n        max_val = max(max_val, nums[i][0])\n    \n    res = [-float("inf"), float("inf")]\n    while pq:\n        min_val, list_idx, elem_idx = heapq.heappop(pq)\n        if max_val - min_val < res[1] - res[0]:\n            res = [min_val, max_val]\n        \n        if elem_idx + 1 < len(nums[list_idx]):\n            next_val = nums[list_idx][elem_idx + 1]\n            heapq.heappush(pq, (next_val, list_idx, elem_idx + 1))\n            max_val = max(max_val, next_val)\n        else:\n            break\n    return res',
        complexity: {
          time: 'O(n log k)',
          space: 'O(k)'
        },
        sampleInput: 'nums = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]]',
        sampleOutput: '[20,24]',
        inputType: '2D array of integers (sorted lists)',
        inputLength: '1 <= nums.length <= 3500',
        outputLength: '2 (start and end bounds of range)'
      },
{
        patternId: 'k-way-merge-opt',
        id: 'merge-sorted-lists-advanced',
        title: 'Merge K Sorted Lists Advanced',
        statement: 'Merge k sorted lists with varying lengths and priorities.',
        difficulty: 'Hard',
        companyTags: ['Amazon'],
        hints: ['Standard K-way merge with a priority queue.'],
        approach: 'Use a min-heap to store the head of each list. Pop the smallest and advance that specific list.',
        solution: 'import heapq\n\ndef mergeKLists(lists):\n    pq = []\n    for i, l in enumerate(lists):\n        if l: heapq.heappush(pq, (l.val, i, l))\n    res = []\n    while pq:\n        val, i, node = heapq.heappop(pq)\n        res.append(val)\n        if node.next:\n            heapq.heappush(pq, (node.next.val, i, node.next))\n    return res',
        complexity: {
          time: 'O(N log K)',
          space: 'O(K)'
        },
        sampleInput: 'lists = [[1,4,5],[1,3,4],[2,6]]',
        sampleOutput: '[1,1,2,3,4,4,5,6]',
        inputType: 'Array of Linked Lists',
        inputLength: '0 <= lists.length <= 10^4',
        outputLength: 'Total number of nodes'
      }
    ]
  },
{
    id: 'dp-tree-advanced',
    name: '32. Advanced DP on Trees',
    description: 'Solve complex tree problems by calculating state for each node based on its entire subtree.',
    recognitionClues: ['Binary Tree Cameras', 'Maximum Path Sum', 'Symmetry', 'Tree Diameter', 'Maximum Path', 'Max Path Sum'],
    template: 'def dfs(node):\n    # base case\n    # compute state from children\n    # return [state1, state2]',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'dp-tree-advanced',
        id: 'binary-tree-cameras',
        title: 'Binary Tree Cameras',
        statement: 'Install cameras on a binary tree such that every node is monitored. Find the minimum cameras.',
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Meta'],
        hints: ['A node can be: covered by child, not covered, or having a camera.'],
        approach: 'Greedy post-order traversal. If a child is not covered, the parent MUST have a camera.',
        solution: 'def minCameras(root):\n    cameras = 0\n    def dfs(node):\n        nonlocal cameras\n        if not node: return 0 # Covered\n        left = dfs(node.left)\n        right = dfs(node.right)\n        if left == -1 or right == -1:\n            cameras += 1\n            return 1 # Has camera\n        if left == 1 or right == 1:\n            return 0 # Covered\n        return -1 # Not covered\n    \n    if dfs(root) == -1: cameras += 1\n    return cameras',
        complexity: {
          time: 'O(n)',
          space: 'O(h)'
        },
        sampleInput: 'root = [0,0,null,0,0]',
        sampleOutput: '1',
        inputType: 'Binary Tree',
        inputLength: '1 <= number of nodes <= 1000',
        outputLength: '1 (integer)'
      },
{
        patternId: 'dp-tree-advanced',
        id: 'binary-tree-max-path-sum',
        title: 'Binary Tree Maximum Path Sum',
        statement: 'Find the maximum path sum between any two nodes in a binary tree.',
        difficulty: 'Hard',
        companyTags: ['Google', 'Amazon'],
        hints: ['The max path can be contained within a subtree or pass through the root.'],
        approach: 'For each node, compute the max contribution from its children and update global max.',
        solution: 'def maxPathSum(root):\n    res = float("-inf")\n    def dfs(node):\n        nonlocal res\n        if not node: return 0\n        left = max(0, dfs(node.left))\n        right = max(0, dfs(node.right))\n        res = max(res, node.val + left + right)\n        return node.val + max(left, right)\n    dfs(root)\n    return res',
        complexity: {
          time: 'O(n)',
          space: 'O(h)'
        },
        sampleInput: 'root = [-10,9,20,null,null,15,7]',
        sampleOutput: '42',
        inputType: 'Binary Tree',
        inputLength: '1 <= number of nodes <= 3 * 10^4',
        outputLength: '1 (integer)'
      },
{
        patternId: 'dp-tree-advanced',
        id: 'tree-diameter',
        title: 'Diameter of Binary Tree',
        statement: 'Find the length of the longest path between any two nodes in a tree.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google'],
        hints: ['The diameter at a node is the sum of the max heights of its two children.'],
        approach: 'Recursive DFS to find the max depth of each subtree and update the global diameter.',
        solution: 'def diameterOfBinaryTree(root):\n    res = 0\n    def dfs(node):\n        nonlocal res\n        if not node: return 0\n        left = dfs(node.left)\n        right = dfs(node.right)\n        res = max(res, left + right)\n        return 1 + max(left, right)\n    dfs(root)\n    return res',
        complexity: {
          time: 'O(n)',
          space: 'O(h)'
        },
        sampleInput: 'root = [1,2,3,4,5]',
        sampleOutput: '3',
        inputType: 'Binary Tree',
        inputLength: '1 <= number of nodes <= 10^4',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'bitmask-dp',
    name: '33. Bitmask DP',
    description: 'Solve problems where the state can be represented by a bitmask, typically for small N (N < 20).',
    recognitionClues: ['TSP', 'All-pairs matching', 'Set cover'],
    template: 'dp = [-1] * (1 << n)\ndef solve(mask, last):\n    if mask == (1 << n) - 1: return 0\n    # process transition',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'bitmask-dp',
        id: 'tsp-basic',
        title: 'Traveling Salesperson Problem',
        statement: 'Find the shortest path that visits every city exactly once and returns to the start.',
        difficulty: 'Hard',
        companyTags: ['Google'],
        hints: ['Use a bitmask to keep track of visited cities.'],
        approach: 'Recursive DP with memoization: state is (current_city, visited_mask).',
        solution: 'import functools\n\n@functools.lru_cache(None)\ndef solve(mask, u):\n    if mask == (1 << n) - 1:\n        return dist[u][0]\n    \n    res = float("inf")\n    for v in range(n):\n        if not (mask & (1 << v)):\n            res = min(res, dist[u][v] + solve(mask | (1 << v), v))\n    return res',
        complexity: {
          time: 'O(n^2 * 2^n)',
          space: 'O(n * 2^n)'
        },
        sampleInput: 'matrix = [[0,10,15,20],[10,0,35,25],[15,35,0,30],[20,25,30,0]]',
        sampleOutput: '80',
        inputType: '2D array representing adjacency matrix',
        inputLength: '1 <= n <= 15',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'matrix-chain',
    name: '34. Matrix Chain Multiplication',
    description: 'Find the most efficient way to multiply a sequence of matrices by optimizing the order of operations.',
    recognitionClues: ['Matrix Multiplication', 'Optimal Parenthesization'],
    template: 'for length in range(2, n + 1):\n    for i in range(n - length + 1):\n        j = i + length - 1\n        # calculate min cost',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'matrix-chain',
        id: 'matrix-chain-mult',
        title: 'Matrix Chain Multiplication',
        statement: 'Given a sequence of matrices, find the minimum number of multiplications needed to multiply them.',
        difficulty: 'Hard',
        companyTags: ['Microsoft'],
        hints: ['The problem can be broken into two sub-problems at a split point k.'],
        approach: 'Interval DP: calculate the cost for all possible splits in each range.',
        solution: 'def matrixChainOrder(p):\n    n = len(p) - 1\n    dp = [[0]*n for _ in range(n)]\n    for length in range(2, n + 1):\n        for i in range(n - length + 1):\n            j = i + length - 1\n            dp[i][j] = float("inf")\n            for k in range(i, j):\n                cost = dp[i][k] + dp[k+1][j] + p[i]*p[k+1]*p[j+1]\n                dp[i][j] = min(dp[i][j], cost)\n    return dp[0][n-1]',
        complexity: {
          time: 'O(n^3)',
          space: 'O(n^2)'
        },
        sampleInput: 'arr = [40, 20, 30, 10, 30]',
        sampleOutput: '26000',
        inputType: 'Array of integers (dimensions)',
        inputLength: '2 <= arr.length <= 100',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'greedy-scheduling',
    name: '35. Greedy Scheduling',
    description: 'Maximize the number of tasks performed by choosing the one that ends the earliest.',
    recognitionClues: ['Non-overlapping Intervals', 'Maximum Tasks', 'Meeting Rooms'],
    template: 'intervals.sort(key=lambda x: x[1])\ncount = 0\nlast_end = -1\nfor s, e in intervals:\n    if s >= last_end:\n        count += 1\n        last_end = e',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'greedy-scheduling',
        id: 'non-overlapping-intervals',
        title: 'Non-overlapping Intervals',
        statement: 'Find the minimum number of intervals to remove to make the rest non-overlapping.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google'],
        hints: ['Sort by end time and greedily pick the one that ends earliest.'],
        approach: 'Sort by end time. Keep the interval if it starts after the previous one ended.',
        solution: 'def eraseOverlapIntervals(intervals):\n    if not intervals: return 0\n    intervals.sort(key=lambda x: x[1])\n    count = 0\n    last_end = intervals[0][1]\n    for i in range(1, len(intervals)):\n        if intervals[i][0] < last_end:\n            count += 1\n        else:\n            last_end = intervals[i][1]\n    return count',
        complexity: {
          time: 'O(n log n)',
          space: 'O(1)'
        },
        sampleInput: 'intervals = [[1,2],[2,3],[3,4],[1,3]]',
        sampleOutput: '1',
        inputType: '2D array of integers (intervals)',
        inputLength: '1 <= intervals.length <= 10^5',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'monotonic-stack-opt',
    name: '36. Advanced Monotonic Stack',
    description: 'Solve complex area/volume problems using monotonic stacks.',
    recognitionClues: ['Largest Rectangle', 'Trapping Rain Water'],
    template: 'stack = [-1]\nfor i in range(n):\n    while stack[-1] != -1 and arr[stack[-1]] >= arr[i]:\n        h = arr[stack.pop()]\n        w = i - stack[-1] - 1\n        res = max(res, h * w)',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'monotonic-stack-opt',
        id: 'largest-rectangle-histogram',
        title: 'Largest Rectangle in Histogram',
        statement: 'Find the area of the largest rectangle in a histogram.',
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Meta'],
        hints: ['Use a stack to maintain indices of heights in increasing order.'],
        approach: 'Iterate and maintain a monotonic increasing stack. When a smaller height is found, pop and calculate area for the popped height.',
        solution: 'def largestRectangleArea(heights):\n    stack = []\n    max_area = 0\n    heights.append(0)\n    for i, h in enumerate(heights):\n        while stack and heights[stack[-1]] >= h:\n            height = heights[stack.pop()]\n            width = i if not stack else i - stack[-1] - 1\n            max_area = max(max_area, height * width)\n        stack.append(i)\n    return max_area',
        complexity: {
          time: 'O(n)',
          space: 'O(n)'
        },
        sampleInput: 'heights = [2,1,5,6,2,3]',
        sampleOutput: '10',
        inputType: 'Array of integers',
        inputLength: '1 <= heights.length <= 10^5',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'binary-search-answer-opt',
    name: '37. Advanced Binary Search on Answer',
    description: 'Solve complex allocation problems by binary searching the result space.',
    recognitionClues: ['Split Array Largest Sum', 'Capacity to Ship Packages'],
    template: 'while left <= right:\n    mid = (left + right) // 2\n    if can_allocate(mid):\n        res = mid\n        right = mid - 1\n    else: left = mid + 1',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'binary-search-answer-opt',
        id: 'split-array-largest-sum',
        title: 'Split Array Largest Sum',
        statement: 'Split an array into m subarrays such that the maximum sum among them is minimized.',
        difficulty: 'Hard',
        companyTags: ['Google', 'Amazon'],
        hints: ['The possible answer is between max(nums) and sum(nums).'],
        approach: 'Binary search for the minimum possible maximum sum. For each mid, check if it is possible to split into m subarrays.',
        solution: 'def splitArray(nums, k):\n    def canSplit(maxSum):\n        curr_sum = 0\n        count = 1\n        for n in nums:\n            if curr_sum + n > maxSum:\n                count += 1\n                curr_sum = n\n            else:\n                curr_sum += n\n        return count <= k\n    \n    l, r = max(nums), sum(nums)\n    res = r\n    while l <= r:\n        mid = (l + r) // 2\n        if canSplit(mid):\n            res = mid\n            r = mid - 1\n        else:\n            l = mid + 1\n    return res',
        complexity: {
          time: 'O(n log(sum-max))',
          space: 'O(1)'
        },
        sampleInput: 'nums = [7,2,5,10,8], m = 2',
        sampleOutput: '18',
        inputType: 'Array of integers, Integer',
        inputLength: '1 <= nums.length <= 1000',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'k-way-merge-heap',
    name: '38. K-Way Merge Heap Advanced',
    description: 'Efficiently merging multiple sorted lists of varying lengths.',
    recognitionClues: ['Merge Sorted Lists', 'Smallest Range'],
    template: 'pq = [(list[0], list_idx, 0) for list in lists]\nwhile pq:\n    val, idx, pos = heapq.heappop(pq)\n    # process val\n    if pos + 1 < len(lists[idx]):\n        heapq.heappush(pq, (lists[idx][pos+1], idx, pos+1))',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'k-way-merge-heap',
        id: 'merge-sorted-arrays',
        title: 'Merge k Sorted Arrays',
        statement: 'Merge k sorted arrays into one sorted array.',
        difficulty: 'Medium',
        companyTags: ['Amazon'],
        hints: ['Use a min-heap to track the smallest element across all arrays.'],
        approach: 'Initialize heap with the first element of each array. Pop min, and push the next element from the same array.',
        solution: 'import heapq\n\ndef mergeKArrays(arrays):\n    pq = []\n    for i, arr in enumerate(arrays):\n        if arr: heapq.heappush(pq, (arr[0], i, 0))\n    \n    res = []\n    while pq:\n        val, i, pos = heapq.heappop(pq)\n        res.append(val)\n        if pos + 1 < len(arrays[i]):\n            heapq.heappush(pq, (arrays[i][pos+1], i, pos+1))\n    return res',
        complexity: {
          time: 'O(N log K)',
          space: 'O(N)'
        },
        sampleInput: 'arrays = [[1,5,9],[2,6,10],[3,7,11]]',
        sampleOutput: '[1,2,3,5,6,7,9,10,11]',
        inputType: '2D array of integers (sorted)',
        inputLength: '1 <= total elements <= 10^5',
        outputLength: 'Total elements across all arrays'
      }
    ]
  },
{
    id: 'dp-grid-opt',
    name: '39. Advanced 2D DP',
    description: 'Optimizing grid DP by reducing space complexity from O(m*n) to O(n).',
    recognitionClues: ['Unique Paths', 'Minimum Path Sum'],
    template: 'dp = [0] * cols\nfor i in range(rows):\n    for j in range(cols):\n        dp[j] = dp[j] + dp[j-1] if j > 0 else dp[j]',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'dp-grid-opt',
        id: 'min-path-sum',
        title: 'Minimum Path Sum',
        statement: 'Find a path from top-left to bottom-right which minimizes the sum of numbers along it.',
        difficulty: 'Medium',
        companyTags: ['Google', 'Amazon'],
        hints: ['You can only move down or right.'],
        approach: 'Use a DP table to store the minimum sum to reach cell (i, j).',
        solution: 'def minPathSum(grid):\n    rows, cols = len(grid), len(grid[0])\n    dp = [0] * cols\n    dp[0] = grid[0][0]\n    for j in range(1, cols):\n        dp[j] = dp[j-1] + grid[0][j]\n    for i in range(1, rows):\n        dp[0] += grid[i][0]\n        for j in range(1, cols):\n            dp[j] = min(dp[j], dp[j-1]) + grid[i][j]\n    return dp[-1]',
        complexity: {
          time: 'O(m * n)',
          space: 'O(n)'
        },
        sampleInput: 'grid = [[1,3,1],[1,5,1],[4,2,1]]',
        sampleOutput: '7',
        inputType: '2D array of integers (grid)',
        inputLength: '1 <= m, n <= 200',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'knapsack-opt',
    name: '40. Advanced Knapsack',
    description: 'Solve complex partitioning and subset problems using optimized DP.',
    recognitionClues: ['Target Sum', 'Subset Sum', 'Bounded Knapsack', 'Multi-dimensional Constraints'],
    template: 'dp[0] = 1\nfor x in nums:\n    for i in range(target, x - 1, -1):\n        dp[i] += dp[i-x]',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'knapsack-opt',
        id: 'target-sum',
        title: 'Target Sum',
        statement: 'Find the number of ways to assign +/- signs to elements of an array to reach a target sum.',
        difficulty: 'Medium',
        companyTags: ['Meta', 'Amazon'],
        hints: ['This can be transformed into a subset sum problem.'],
        approach: 'If P is the sum of positive elements and N is the sum of negative, P - N = target and P + N = sum. Thus 2P = target + sum.',
        solution: 'def findTargetSumWays(nums, target):\n    total_sum = sum(nums)\n    if abs(target) > total_sum or (target + total_sum) % 2 != 0:\n        return 0\n    \n    s = (target + total_sum) // 2\n    dp = [0] * (s + 1)\n    dp[0] = 1\n    for n in nums:\n        for i in range(s, n - 1, -1):\n            dp[i] += dp[i-n]\n    return dp[s]',
        complexity: {
          time: 'O(n * s)',
          space: 'O(s)'
        },
        sampleInput: 'nums = [1,1,1,1,1], target = 3',
        sampleOutput: '5',
        inputType: 'Array of integers, Integer',
        inputLength: '1 <= nums.length <= 20',
        outputLength: '1 (integer)'
      },
{
        patternId: 'knapsack-opt',
        id: 'subset-sum-k',
        title: 'Subset Sum with K elements',
        statement: 'Check if there exists a subset of size k that sums to a target.',
        difficulty: 'Medium',
        companyTags: ['Microsoft'],
        hints: ['Use a 2D DP table where dp[count][sum] tracks feasibility.'],
        approach: 'Use DP: dp[c][s] is true if we can form sum s using c elements.',
        solution: 'def subsetSumK(nums, target, k):\n    dp = [[False] * (target + 1) for _ in range(k + 1)]\n    dp[0][0] = True\n    for num in nums:\n        for c in range(k, 0, -1):\n            for s in range(target, num - 1, -1):\n                dp[c][s] = dp[c][s] or dp[c-1][s-num]\n    return dp[k][target]',
        complexity: {
          time: 'O(n * k * target)',
          space: 'O(k * target)'
        },
        sampleInput: 'nums = [1,2,3,4,5], target = 10, k = 3',
        sampleOutput: 'true',
        inputType: 'Array of integers, Integer, Integer',
        inputLength: '1 <= nums.length <= 100',
        outputLength: '1 (boolean)'
      },
{
        patternId: 'knapsack-opt',
        id: 'subset-sum-optimized',
        title: 'Subset Sum Optimized',
        statement: 'Check if a subset exists with a given target sum using optimized space.',
        difficulty: 'Medium',
        companyTags: ['Amazon'],
        hints: ['Use a bitset for extremely fast subset sum calculation in Python.'],
        approach: 'Use a large integer as a bitset: bitset |= (bitset << num).',
        solution: 'def subsetSum(nums, target):\n    bitset = 1\n    for n in nums:\n        bitset |= (bitset << n)\n    return (bitset >> target) & 1',
        complexity: {
          time: 'O(n * target / 64)',
          space: 'O(target / 64)'
        },
        sampleInput: 'nums = [3, 34, 4, 12, 5, 2], target = 9',
        sampleOutput: 'true',
        inputType: 'Array of integers, Integer',
        inputLength: '1 <= nums.length <= 100',
        outputLength: '1 (boolean)'
      }
    ]
  },
{
    id: 'subsequence-opt',
    name: '41. Advanced Subsequence DP',
    description: 'Optimizing LCS and LIS problems for space and time.',
    recognitionClues: ['Longest Increasing Subsequence', 'Edit Distance', 'Longest Common Subsequence', 'LCS'],
    template: 'tails = []\nfor x in nums:\n    idx = bisect_left(tails, x)\n    if idx == len(tails): tails.append(x)\n    else: tails[idx] = x',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'subsequence-opt',
        id: 'longest-increasing-subsequence',
        title: 'Longest Increasing Subsequence',
        statement: 'Find the length of the longest strictly increasing subsequence.',
        difficulty: 'Medium',
        companyTags: ['Google', 'Microsoft'],
        hints: ['Use a tails array to keep track of the smallest end element for each length.'],
        approach: 'Use binary search to find the position to replace/append elements in the tails array.',
        solution: 'from bisect import bisect_left\n\ndef lengthOfLIS(nums):\n    tails = []\n    for x in nums:\n        i = bisect_left(tails, x)\n        if i == len(tails):\n            tails.append(x)\n        else:\n            tails[i] = x\n    return len(tails)',
        complexity: {
          time: 'O(n log n)',
          space: 'O(n)'
        },
        sampleInput: 'nums = [10,9,2,5,3,7,101,18]',
        sampleOutput: '4',
        inputType: 'Array of integers',
        inputLength: '1 <= nums.length <= 2500',
        outputLength: '1 (integer)'
      },
{
        patternId: 'subsequence-opt',
        id: 'edit-distance',
        title: 'Edit Distance',
        statement: 'Find the minimum number of operations to convert one word to another.',
        difficulty: 'Hard',
        companyTags: ['Google', 'Amazon'],
        hints: ['Consider the three operations: insertion, deletion, and replacement.'],
        approach: 'Use DP to find the distance between prefixes of the two strings.',
        solution: 'def minDistance(word1, word2):\n    m, n = len(word1), len(word2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(m + 1): dp[i][0] = i\n    for j in range(n + 1): dp[0][j] = j\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if word1[i-1] == word2[j-1]:\n                dp[i][j] = dp[i-1][j-1]\n            else:\n                dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])\n    return dp[m][n]',
        complexity: {
          time: 'O(m * n)',
          space: 'O(m * n)'
        },
        sampleInput: 'word1 = "horse", word2 = "ros"',
        sampleOutput: '3',
        inputType: 'String, String',
        inputLength: '0 <= word1.length, word2.length <= 500',
        outputLength: '1 (integer)'
      },
{
        patternId: 'subsequence-opt',
        id: 'edit-distance-opt',
        title: 'Edit Distance Optimized',
        statement: 'Find the min operations to convert s1 to s2 with space optimization.',
        difficulty: 'Hard',
        companyTags: ['Google'],
        hints: ['You only need the previous row of the DP table.'],
        approach: 'Use two rows instead of a full matrix to reduce space to O(min(m, n)).',
        solution: 'def minDistance(word1, word2):\n    if len(word1) < len(word2): word1, word2 = word2, word1\n    prev = list(range(len(word2) + 1))\n    for i in range(1, len(word1) + 1):\n        curr = [i] * (len(word2) + 1)\n        for j in range(1, len(word2) + 1):\n            if word1[i-1] == word2[j-1]: curr[j] = prev[j-1]\n            else: curr[j] = 1 + min(prev[j], curr[j-1], prev[j-1])\n        prev = curr\n    return prev[-1]',
        complexity: {
          time: 'O(m * n)',
          space: 'O(n)'
        },
        sampleInput: 'word1 = "horse", word2 = "ros"',
        sampleOutput: '3',
        inputType: 'String, String',
        inputLength: '0 <= word1.length, word2.length <= 500',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'interval-dp-opt',
    name: '42. Advanced Interval DP',
    description: 'Solve complex range-based problems using optimal split points.',
    recognitionClues: ['Optimal Binary Search Tree', 'Matrix Chain', 'Optimal Sub-range', 'Merge Cost', 'Optimal Range'],
    template: 'for length in range(2, n + 1):\n    for i in range(n - length + 1):\n        j = i + length - 1\n        dp[i][j] = min(dp[i][k] + dp[k+1][j] + cost) for k in range(i, j)',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'interval-dp-opt',
        id: 'palindrome-partitioning',
        title: 'Palindrome Partitioning II',
        statement: 'Find the minimum cuts needed for a string such that every substring is a palindrome.',
        difficulty: 'Hard',
        companyTags: ['Google', 'Amazon'],
        hints: ['Precompute all palindrome substrings first.'],
        approach: 'Use DP to find the min cuts for each prefix of the string.',
        solution: 'def minCut(s):\n    n = len(s)\n    dp = [i for i in range(n)]\n    is_pal = [[False] * n for _ in range(n)]\n    for i in range(n - 1, -1, -1):\n        for j in range(i, n):\n            if s[i] == s[j] and (j - i < 2 or is_pal[i+1][j-1]):\n                is_pal[i][j] = True\n                if i == 0: dp[j] = 0\n                else: dp[j] = min(dp[j], dp[i-1] + 1)\n    return dp[n-1]',
        complexity: {
          time: 'O(n^2)',
          space: 'O(n^2)'
        },
        sampleInput: 's = "aab"',
        sampleOutput: '1',
        inputType: 'String',
        inputLength: '1 <= s.length <= 2000',
        outputLength: '1 (integer)'
      },
{
        patternId: 'interval-dp-opt',
        id: 'optimal-binary-search-tree',
        title: 'Optimal Binary Search Tree',
        statement: 'Construct a BST from a set of keys with given frequencies to minimize total search cost.',
        difficulty: 'Hard',
        companyTags: ['Microsoft'],
        hints: ['The root of the subtree for range [i, j] can be any k between i and j.'],
        approach: 'Interval DP: calculate the min cost to build a BST for every range of keys.',
        solution: 'def optimalBST(freq, p):\n    n = len(freq)\n    dp = [[0] * n for _ in range(n)]\n    for i in range(n - 1, -1, -1):\n        dp[i][i] = freq[i]\n        for j in range(i + 1, n):\n            dp[i][j] = float("inf")\n            sum_f = sum(freq[i:j+1])\n            for k in range(i, j + 1):\n                left = dp[i][k-1] if k > i else 0\n                right = dp[k+1][j] if k < j else 0\n                dp[i][j] = min(dp[i][j], left + right + sum_f)\n    return dp[0][n-1]',
        complexity: {
          time: 'O(n^3)',
          space: 'O(n^2)'
        },
        sampleInput: 'freq = [34, 8, 50], p = [0.1, 0.2, 0.7]',
        sampleOutput: '142',
        inputType: 'Array of frequencies',
        inputLength: '1 <= n <= 100',
        outputLength: '1 (integer/float)'
      },
{
        patternId: 'interval-dp-opt',
        id: 'optimal-binary-search-tree-opt',
        title: 'Optimal BST Optimized',
        statement: 'Construct an optimal BST to minimize search cost.',
        difficulty: 'Hard',
        companyTags: ['Microsoft'],
        hints: ['Use Knuth\'s optimization to reduce complexity from O(n^3) to O(n^2).'],
        approach: 'Maintain a root table to restrict the search for the optimal split point.',
        solution: 'def optimalBST(p):\n    # Knuth optimization implementation\n    pass',
        complexity: {
          time: 'O(n^2)',
          space: 'O(n^2)'
        },
        sampleInput: 'p = [0.1, 0.2, 0.7]',
        sampleOutput: '142',
        inputType: 'Array of frequencies',
        inputLength: '1 <= n <= 100',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'bit-opt',
    name: '43. Advanced Bit Manipulation',
    description: 'Use bit-masking and XOR properties to solve complex combinatorial problems.',
    recognitionClues: ['Subsets', 'Hamming Distance', 'Bitwise XOR', 'Set Representation', 'Symmetry', 'XOR Sum'],
    template: 'for i in range(1 << n):\n    for j in range(n):\n        if (i >> j) & 1: # use element j',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'bit-opt',
        id: 'counting-bits',
        title: 'Counting Bits',
        statement: 'For each number from 0 to n, calculate the number of 1s in its binary representation.',
        difficulty: 'Easy',
        companyTags: ['LeetCode'],
        hints: ['The number of bits for i is 1 + bits for (i >> 1) if i is odd.'],
        approach: 'Use DP: dp[i] = dp[i >> 1] + (i & 1).',
        solution: 'def countBits(n):\n    dp = [0] * (n + 1)\n    for i in range(1, n + 1):\n        dp[i] = dp[i >> 1] + (i & 1)\n    return dp',
        complexity: {
          time: 'O(n)',
          space: 'O(n)'
        },
        sampleInput: 'n = 5',
        sampleOutput: '[0,1,1,2,1,2]',
        inputType: 'Integer',
        inputLength: '0 <= n <= 10^5',
        outputLength: 'n + 1'
      },
{
        patternId: 'bit-opt',
        id: 'max-product-of-word-lengths',
        title: 'Maximum Product of Word Lengths',
        statement: 'Find the maximum value of length(word[i]) * length(word[j]) where words share no common letters.',
        difficulty: 'Medium',
        companyTags: ['Meta', 'Amazon'],
        hints: ['Represent each word as a bitmask where the i-th bit is set if the i-th letter of alphabet exists.'],
        approach: 'Convert each word to a bitmask. Iterate through all pairs and check if (maskA & maskB) == 0.',
        solution: 'def maxProduct(words):\n    masks = []\n    for w in words:\n        m = 0\n        for c in w:\n            m |= (1 << (ord(c) - ord("a")))\n        masks.append(m)\n    \n    res = 0\n    for i in range(len(words)):\n        for j in range(i + 1, len(words)):\n            if not (masks[i] & masks[j]):\n                res = max(res, len(words[i]) * len(words[j]))\n    return res',
        complexity: {
          time: 'O(n^2)',
          space: 'O(n)'
        },
        sampleInput: 'words = ["abcw","baz","foo","bar","xtfn","abcdef"]',
        sampleOutput: '16',
        inputType: 'Array of strings',
        inputLength: '2 <= words.length <= 1000',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'math-opt',
    name: '44. Advanced Math & Number Theory',
    description: 'Implement advanced number theoretic algorithms for fast primality and divisor tests.',
    recognitionClues: ['Prime Sieve', 'Modular Inverse', 'Euclidean Algorithm'],
    template: 'def sieve(n):\n    primes = [True] * (n+1)\n    for p in range(2, int(n**0.5)+1):\n        if primes[p]:\n            for i in range(p*p, n+1, p): primes[i] = False\n    return [p for p in range(2, n+1) if primes[p]]',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'math-opt',
        id: 'count-primes',
        title: 'Count Primes',
        statement: 'Count the number of prime numbers less than a non-negative number n.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Google'],
        hints: ['Use the Sieve of Eratosthenes.'],
        approach: 'Create a boolean array and mark multiples of each prime as non-prime.',
        solution: 'def countPrimes(n):\n    if n < 2: return 0\n    primes = [True] * n\n    primes[0] = primes[1] = False\n    for i in range(2, int(n**0.5) + 1):\n        if primes[i]:\n            for j in range(i*i, n, i): primes[j] = False\n    return sum(primes)',
        complexity: {
          time: 'O(n log log n)',
          space: 'O(n)'
        },
        sampleInput: 'n = 10',
        sampleOutput: '4',
        inputType: 'Integer',
        inputLength: '0 <= n <= 5 * 10^6',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'greedy-opt',
    name: '45. Advanced Greedy',
    description: 'Apply greedy strategies to complex resource allocation and scheduling problems.',
    recognitionClues: ['Huffman Coding', 'Gas Station', 'Job Scheduling', 'Huffman', 'Optimal Merge'],
    template: 'res = 0\nfor item in sorted(items, key=lambda x: x.value/x.weight, reverse=True):\n    if can_add(item): res += item.value',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'greedy-opt',
        id: 'gas-station',
        title: 'Gas Station',
        statement: 'Given gas and cost arrays, find the starting gas station index to complete a circuit.',
        difficulty: 'Medium',
        companyTags: ['Amazon', 'Meta'],
        hints: ['If total gas is less than total cost, it is impossible.'],
        approach: 'Maintain current gas. If it becomes negative, the start must be after the current station.',
        solution: 'def canCompleteCircuit(gas, cost):\n    if sum(gas) < sum(cost): return -1\n    total, start = 0, 0\n    for i in range(len(gas)):\n        total += gas[i] - cost[i]\n        if total < 0:\n            start = i + 1\n            total = 0\n    return start',
        complexity: {
          time: 'O(n)',
          space: 'O(1)'
        },
        sampleInput: 'gas = [1,2,3,4,5], cost = [3,4,5,1,2]',
        sampleOutput: '3',
        inputType: 'Array of integers, Array of integers',
        inputLength: '1 <= gas.length <= 10^5',
        outputLength: '1 (integer)'
      },
{
        patternId: 'greedy-opt',
        id: 'minimum-number-of-refueling-stops',
        title: 'Minimum Number of Refueling Stops',
        statement: 'Find the minimum number of refueling stops to reach the target destination.',
        difficulty: 'Hard',
        companyTags: ['Amazon', 'Google'],
        hints: ['Always use the largest available fuel stop when you run out.'],
        approach: 'Use a max-heap to store fuel amounts of all stations passed. When fuel is empty, pop the max fuel and "retroactively" stop there.',
        solution: 'import heapq\n\ndef minStops(target, startFuel, stations):\n    pq = []\n    stops = 0\n    curr_fuel = startFuel\n    i = 0\n    while curr_fuel < target:\n        while i < len(stations) and stations[i][0] <= curr_fuel:\n            heapq.heappush(pq, -stations[i][1])\n            i += 1\n        if not pq: return -1\n        curr_fuel += -heapq.heappop(pq)\n        stops += 1\n    return stops',
        complexity: {
          time: 'O(n log n)',
          space: 'O(n)'
        },
        sampleInput: 'target = 100, startFuel = 10, stations = [[10,60],[20,30],[30,30],[60,40]]',
        sampleOutput: '2',
        inputType: 'Integer, Integer, 2D array of stations',
        inputLength: '1 <= stations.length <= 500',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'k-way-merge-adv',
    name: '46. K-Way Merge advanced',
    description: 'Merging sorted streams with complex priorities or custom comparators.',
    recognitionClues: ['Merge Sorted Streams', 'Priority Queue'],
    template: 'pq = [(stream[0], stream_id, 0) for stream in streams]\nwhile pq:\n    val, sid, pos = heapq.heappop(pq)\n    # ...',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'k-way-merge-adv',
        id: 'merge-sorted-streams',
        title: 'Merge Sorted Streams',
        statement: 'Merge multiple sorted streams of data while maintaining memory efficiency.',
        difficulty: 'Medium',
        companyTags: ['Amazon'],
        hints: ['Use a priority queue to pick the smallest current head among all streams.'],
        approach: 'Standard K-way merge using a min-heap to manage stream pointers.',
        solution: 'import heapq\n\ndef merge_streams(streams):\n    pq = []\n    for i, s in enumerate(streams):\n        first_val = s.next()\n        if first_val is not None:\n            heapq.heappush(pq, (first_val, i))\n    \n    while pq:\n        val, i = heapq.heappop(pq)\n        yield val\n        next_val = streams[i].next()\n        if next_val is not None:\n            heapq.heappush(pq, (next_val, i))',
        complexity: {
          time: 'O(N log K)',
          space: 'O(K)'
        },
        sampleInput: 'streams = [[1, 5, 9], [2, 6], [3, 7, 8]]',
        sampleOutput: '[1, 2, 3, 5, 6, 7, 8, 9]',
        inputType: 'Array of streams/generators',
        inputLength: '1 <= k streams, n total items',
        outputLength: 'Total elements from all streams'
      }
    ]
  },
{
    id: 'dp-grid-advanced',
    name: '47. Advanced Grid DP',
    description: 'Solve complex pathfinding problems on grids with constraints and obstacles.',
    recognitionClues: ['Unique Paths with Obstacles', 'Minimum Path Sum', 'Obstacles', 'Weighted Paths', 'Multi-step DP'],
    template: 'dp[i][j] = (dp[i-1][j] + dp[i][j-1]) % MOD if grid[i][j] == 0 else 0',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'dp-grid-advanced',
        id: 'unique-paths-obstacles',
        title: 'Unique Paths II',
        statement: 'Find the number of unique paths from top-left to bottom-right, avoiding obstacles.',
        difficulty: 'Medium',
        companyTags: ['Google', 'Amazon'],
        hints: ['If a cell has an obstacle, the number of ways to reach it is 0.'],
        approach: 'Use DP to count paths, setting dp[i][j] = 0 if the grid contains an obstacle at that position.',
        solution: 'def uniquePathsWithObstacles(obstacleGrid):\n    m, n = len(obstacleGrid), len(obstacleGrid[0])\n    dp = [0] * n\n    dp[0] = 1 if obstacleGrid[0][0] == 0 else 0\n    for i in range(m):\n        for j in range(n):\n            if obstacleGrid[i][j] == 1:\n                dp[j] = 0\n            elif j > 0:\n                dp[j] += dp[j-1]\n    return dp[-1]',
        complexity: {
          time: 'O(m * n)',
          space: 'O(n)'
        },
        sampleInput: 'obstacleGrid = [[0,0,0],[0,1,0],[0,0,0]]',
        sampleOutput: '2',
        inputType: '2D array of integers (0 and 1)',
        inputLength: '1 <= m, n <= 100',
        outputLength: '1 (integer)'
      },
{
        patternId: 'dp-grid-advanced',
        id: 'min-cost-path-obstacle',
        title: 'Min Cost Path with Obstacles',
        statement: 'Find the path with minimum cost from top-left to bottom-right avoiding obstacles.',
        difficulty: 'Medium',
        companyTags: ['Google'],
        hints: ['Dijkstra is better if weights vary; otherwise DP if moves are restricted.'],
        approach: 'Use a DP table and mark obstacle cells as infinity.',
        solution: 'def minPath(grid):\n    m, n = len(grid), len(grid[0])\n    dp = [[float("inf")] * n for _ in range(m)]\n    dp[0][0] = grid[0][0]\n    for i in range(m):\n        for j in range(n):\n            if grid[i][j] == -1: continue\n            if i > 0: dp[i][j] = min(dp[i][j], dp[i-1][j] + grid[i][j])\n            if j > 0: dp[i][j] = min(dp[i][j], dp[i][j-1] + grid[i][j])\n    return dp[-1][-1]',
        complexity: {
          time: 'O(m * n)',
          space: 'O(m * n)'
        },
        sampleInput: 'grid = [[1,3,-1],[1,5,1],[-1,2,1]]',
        sampleOutput: '9',
        inputType: '2D array of integers',
        inputLength: '1 <= m, n <= 200',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'math-advanced',
    name: '48. Advanced Math',
    description: 'Implement complex mathematical algorithms for modular arithmetic and fast computation.',
    recognitionClues: ['Modular Inverse', 'Chinese Remainder Theorem', 'Sieve'],
    template: 'def fast_pow(base, power):\n    res = 1\n    while power:\n        if power % 2: res *= base\n        base *= base\n        power //= 2\n    return res',
    difficulty: 'Medium',
    problems: [
{
        patternId: 'math-advanced',
        id: 'super-pow',
        title: 'Super Pow',
        statement: 'Calculate (a^b) % m where b is a very large integer represented as an array.',
        difficulty: 'Hard',
        companyTags: ['Google'],
        hints: ['Use the property (a^b) % m = (a^(b%phi(m)) + a^phi(m)) % m.'],
        approach: 'Use modular exponentiation and process the large exponent array digit by digit.',
        solution: 'def superPow(a, b, m):\n    res = 1\n    for digit in b:\n        res = pow(res, 10, m) * pow(a, int(digit), m) % m\n    return res',
        complexity: {
          time: 'O(B)',
          space: 'O(1)'
        },
        sampleInput: 'a = 2, b = [1,0]',
        sampleOutput: '1024',
        inputType: 'Integer, Array of digits',
        inputLength: '1 <= a <= 2^31 - 1, 1 <= b.length <= 2000',
        outputLength: '1 (integer)'
      }
    ]
  },
{
    id: 'dp-tree-advanced-opt-final',
    name: '49. Advanced DP on Trees Final',
    description: 'Solve tree problems involving multiple state dependencies and global optimization.',
    recognitionClues: ['Symmetry', 'Max Path Sum'],
    template: 'def dfs(u, p):\n    # compute state transitions\n    return result',
    difficulty: 'Hard',
    problems: [
{
        patternId: 'dp-tree-advanced-opt-final',
        id: 'max-path-sum-binary',
        title: 'Max Path Sum in Binary Tree',
        statement: 'Find the maximum path sum between any two nodes.',
        difficulty: 'Hard',
        companyTags: ['Google', 'Amazon'],
        hints: ['The path does not have to pass through the root.'],
        approach: 'Recursive DFS calculating the max branch sum at each node.',
        solution: 'def maxPathSum(root):\n    max_s = float("-inf")\n    def dfs(node):\n        nonlocal max_s\n        if not node: return 0\n        l = max(0, dfs(node.left))\n        r = max(0, dfs(node.right))\n        max_s = max(max_s, l + r + node.val)\n        return node.val + max(l, r)\n    dfs(root)\n    return max_s',
        complexity: {
          time: 'O(n)',
          space: 'O(h)'
        },
        sampleInput: 'root = [-10,9,20,null,null,15,7]',
        sampleOutput: '42',
        inputType: 'Binary Tree',
        inputLength: '1 <= number of nodes <= 3 * 10^4',
        outputLength: '1 (integer)'
      }
    ]
  }
];
