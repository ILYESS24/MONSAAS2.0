#!/bin/bash
# Script to move test files to test/ directory

mkdir -p test

# Move test files
for file in $(ls -1 | grep -E '\.(spec|cjs|test)\.|test-' | grep -v node_modules); do
    if [ -f "$file" ]; then
        echo "Moving $file to test/"
        mv "$file" test/
    fi
done

echo "Test files moved successfully"
