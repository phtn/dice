#!/bin/bash

# Add Jest and testing library dependencies
bun add -D jest @types/jest jest-environment-jsdom
bun add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
bun add -D next/jest

echo "Test dependencies added successfully!"
echo "You can now run tests with: bun test"