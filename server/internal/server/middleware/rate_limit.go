package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type clientState struct {
	count     int
	resetTime time.Time
}

type RateLimiter struct {
	mu     sync.Mutex
	max    int
	window time.Duration
	state  map[string]*clientState
}

func NewIPRateLimiter(max int, window time.Duration) *RateLimiter {
	return &RateLimiter{
		max:    max,
		window: window,
		state:  make(map[string]*clientState),
	}
}

func (r *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if r.allow(c.ClientIP()) {
			c.Next()
			return
		}
		c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests"})
	}
}

func (r *RateLimiter) allow(ip string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	entry, ok := r.state[ip]
	if !ok || now.After(entry.resetTime) {
		r.state[ip] = &clientState{
			count:     1,
			resetTime: now.Add(r.window),
		}
		return true
	}

	if entry.count >= r.max {
		return false
	}

	entry.count++
	return true
}
