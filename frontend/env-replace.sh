#!/bin/sh

echo "Injecting runtime environment variables into Vite static files..."

VARS="VITE_API_BASE_URL VITE_CLIENT_ID VITE_REDIRECT_URI VITE_CLIENT_SECRET VITE_BACKEND_URL VITE_BACKEND_API_KEY VITE_ONE_PORTAL_CLIENT_ID VITE_ONE_PORTAL_URL BACKEND_PROXY_TARGET"

for file in /usr/share/nginx/html/assets/*.js; do
  if [ -f "$file" ]; then
    for var in $VARS; do
      # Safely evaluate the environment variable value
      val=$(eval echo \$$var)
      
      # If the variable is empty, replace the placeholder with an empty string
      if [ -z "$val" ]; then
        sed -i "s|__${var}__||g" "$file"
      else
        # Escape characters that sed treats specially in the replacement string
        escaped_val=$(printf '%s\n' "$val" | sed -e 's/[\/&]/\\&/g' -e 's/|/\\|/g')
        sed -i "s|__${var}__|${escaped_val}|g" "$file"
      fi
    done
    
    # If the app was pre-compressed by Vite (e.g., vite-plugin-compression),
    # the .gz file will still have the old placeholders! We must update it.
    if [ -f "${file}.gz" ]; then
      rm -f "${file}.gz"
      gzip -c "$file" > "${file}.gz"
    fi
  fi
done

echo "Environment injection complete."
