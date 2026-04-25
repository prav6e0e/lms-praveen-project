import py_compile
import os
from pathlib import Path

errors = []
file_count = 0

for py_file in Path('.').rglob('*.py'):
    file_count += 1
    try:
        py_compile.compile(str(py_file), doraise=True)
    except py_compile.PyCompileError as e:
        errors.append((str(py_file), str(e)))

print(f'Total files checked: {file_count}')
print(f'Files with syntax errors: {len(errors)}')

if errors:
    print('\n--- ERRORS FOUND ---')
    for filepath, error in errors[:30]:
        print(f'\n{filepath}:')
        print(error)
else:
    print('\nNo syntax errors found!')
