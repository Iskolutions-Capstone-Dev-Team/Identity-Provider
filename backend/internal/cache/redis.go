// Package cache provides a thin Redis-backed caching abstraction.
package cache

import (
	"context"
	"errors"
	"time"

	"github.com/redis/go-redis/v9"
)

// Cache defines the caching operations used by the application services.
type Cache interface {
	// Set stores a value under key for the given duration.
	Set(
		ctx context.Context,
		key, val string,
		ttl time.Duration,
	) error

	// Get retrieves the value for key.
	// Returns ("", false, nil) on a cache miss.
	Get(ctx context.Context, key string) (string, bool, error)

	// Delete removes the given key from the cache.
	Delete(ctx context.Context, key string) error

	// Incr increments the integer value of a key.
	Incr(ctx context.Context, key string) (int64, error)
}

type redisCache struct {
	client *redis.Client
}

// NewRedisCache creates a Cache backed by the provided redis.Client.
func NewRedisCache(client *redis.Client) Cache {
	return &redisCache{client: client}
}

// Set stores a value under key.
func (r *redisCache) Set(
	ctx context.Context,
	key, val string,
	ttl time.Duration,
) error {
	return r.client.Set(ctx, key, val, ttl).Err()
}

// Get retrieves a value under key.
func (r *redisCache) Get(
	ctx context.Context,
	key string,
) (string, bool, error) {
	val, err := r.client.Get(ctx, key).Result()
	if errors.Is(err, redis.Nil) {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	return val, true, nil
}

// Delete removes a key.
func (r *redisCache) Delete(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}

// Incr increments a key.
func (r *redisCache) Incr(ctx context.Context, key string) (int64, error) {
	return r.client.Incr(ctx, key).Result()
}

type noopCache struct{}

// NewNoopCache creates a Cache that does nothing.
func NewNoopCache() Cache {
	return &noopCache{}
}

// Set is a no-op.
func (n *noopCache) Set(
	ctx context.Context,
	key, val string,
	ttl time.Duration,
) error {
	return nil
}

// Get is a no-op.
func (n *noopCache) Get(
	ctx context.Context,
	key string,
) (string, bool, error) {
	return "", false, nil
}

// Delete is a no-op.
func (n *noopCache) Delete(ctx context.Context, key string) error {
	return nil
}

// Incr is a no-op.
func (n *noopCache) Incr(ctx context.Context, key string) (int64, error) {
	return 0, nil
}
