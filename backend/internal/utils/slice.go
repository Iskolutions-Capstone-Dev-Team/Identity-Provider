package utils

// Map applies a transform function to each element of a slice.
// It pre-allocates the result slice to optimize memory usage.
func Map[T any, V any](input []T, transform func(T) V) []V {
	result := make([]V, len(input))
	for i, item := range input {
		result[i] = transform(item)
	}
	return result
}