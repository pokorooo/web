from flask import Flask, render_template, request, jsonify
import random
import json

app = Flask(__name__)

class SudokuGenerator:
    def __init__(self):
        self.grid = [[0 for _ in range(9)] for _ in range(9)]
    
    def is_valid(self, grid, row, col, num):
        # 行チェック
        for x in range(9):
            if grid[row][x] == num:
                return False
        
        # 列チェック
        for x in range(9):
            if grid[x][col] == num:
                return False
        
        # 3x3ボックスチェック
        start_row = row - row % 3
        start_col = col - col % 3
        for i in range(3):
            for j in range(3):
                if grid[i + start_row][j + start_col] == num:
                    return False
        return True
    
    def solve_sudoku(self, grid):
        for row in range(9):
            for col in range(9):
                if grid[row][col] == 0:
                    for num in range(1, 10):
                        if self.is_valid(grid, row, col, num):
                            grid[row][col] = num
                            if self.solve_sudoku(grid):
                                return True
                            grid[row][col] = 0
                    return False
        return True
    
    def generate_full_grid(self):
        grid = [[0 for _ in range(9)] for _ in range(9)]
        
        # ランダムに数字を配置して完全なグリッドを生成
        for i in range(9):
            for j in range(9):
                if grid[i][j] == 0:
                    nums = list(range(1, 10))
                    random.shuffle(nums)
                    for num in nums:
                        if self.is_valid(grid, i, j, num):
                            grid[i][j] = num
                            if self.solve_sudoku(grid):
                                break
                            grid[i][j] = 0
        return grid
    
    def generate_puzzle(self, difficulty='medium'):
        # 完全なグリッドを生成
        complete_grid = self.generate_full_grid()
        puzzle = [row[:] for row in complete_grid]
        
        # 難易度に応じて空のセルを作成
        cells_to_remove = {
            'easy': 35,
            'medium': 45,
            'hard': 55
        }.get(difficulty, 45)
        
        positions = [(i, j) for i in range(9) for j in range(9)]
        random.shuffle(positions)
        
        for i in range(cells_to_remove):
            row, col = positions[i]
            puzzle[row][col] = 0
        
        return puzzle, complete_grid

@app.route('/api/sudoku')
def sudoku_game():
    return render_template('sudoku.html')

@app.route('/api/sudoku/new', methods=['POST'])
def new_game():
    data = request.get_json()
    difficulty = data.get('difficulty', 'medium')
    
    generator = SudokuGenerator()
    puzzle, solution = generator.generate_puzzle(difficulty)
    
    return jsonify({
        'puzzle': puzzle,
        'solution': solution
    })

@app.route('/api/sudoku/validate', methods=['POST'])
def validate_solution():
    data = request.get_json()
    grid = data.get('grid')
    
    # バリデーション実行
    is_valid = True
    errors = []
    
    for row in range(9):
        for col in range(9):
            if grid[row][col] != 0:
                num = grid[row][col]
                grid[row][col] = 0  # 一時的に0にして重複をチェック
                
                generator = SudokuGenerator()
                if not generator.is_valid(grid, row, col, num):
                    is_valid = False
                    errors.append({'row': row, 'col': col})
                
                grid[row][col] = num  # 元に戻す
    
    return jsonify({
        'is_valid': is_valid,
        'errors': errors
    })

@app.route('/api/sudoku/hint', methods=['POST'])
def get_hint():
    data = request.get_json()
    puzzle = data.get('puzzle')
    solution = data.get('solution')
    
    # 空のセルからランダムにヒントを選択
    empty_cells = []
    for row in range(9):
        for col in range(9):
            if puzzle[row][col] == 0:
                empty_cells.append((row, col))
    
    if empty_cells:
        row, col = random.choice(empty_cells)
        return jsonify({
            'row': row,
            'col': col,
            'value': solution[row][col]
        })
    
    return jsonify({'message': '全て埋まっています'})

if __name__ == '__main__':
    app.run(debug=True)