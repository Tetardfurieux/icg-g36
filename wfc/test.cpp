#include <iostream>
#include <vector>
#include <array>
#include <stdlib.h>


using namespace std;

typedef array<array<int, 3>, 3> tile;

const int WIDTH = 10;

int rd() {
    return rand() % WIDTH;
}

bool check_bottom(tile current, tile under) {
    for (int i = 0; i < 3; i++) {
        if (current[2][i] != under[0][i]) {
            return false;
        }
    }
    return true;
}

bool check_top(tile current, tile above) {
    for (int i = 0; i < 3; i++) {
        if (current[0][i] != above[2][i]) {
            return false;
        }
    }
    return true;
}

bool check_right(tile current, tile right) {
    for (int i = 0; i < 3; i++) {
        if (current[i][2] != right[i][0]) {
            return false;
        }
    }
    return true;
}

bool check_left(tile current, tile left) {
    for (int i = 0; i < 3; i++) {
        if (current[i][0] != left[i][2]) {
            return false;
        }
    }
    return true;
}

void compute_entropy(vector<tile> tileset, vector<vector<tile>> map, vector<vector<vector<tile>>>& candidates, vector<vector<bool>> converged, int x, int y) {
    if (converged[x][y]) {
        return;
    }
    for (int i = 0; i < tileset.size(); i++) {
        bool valid = true;
        if (x > 0 && converged[x-1][y] && !check_right(tileset[i], map[x-1][y])) {
            valid = false;
        }
        if (x < 4 && converged[x+1][y] && !check_left(tileset[i], map[x+1][y])) {
            valid = false;
        }
        if (y > 0 && converged[x][y-1] && !check_bottom(tileset[i], map[x][y-1])) {
            valid = false;
        }
        if (y < 4 && converged[x][y+1] && !check_top(tileset[i], map[x][y+1])) {
            valid = false;
        }
        if (valid) {
            candidates[x][y].push_back(tileset[i]);
        }
    }

}


bool check_converged(vector<vector<bool>> converged) {
    for (int i = 0; i < WIDTH; i++) {
        for (int j = 0; j < WIDTH ; j++) {
            if (!converged[i][j]) {
                return false;
            }
        }
    }
    return true;
}

void draw_map(vector<vector<tile>> map) {

    vector<vector<int>> final = vector<vector<int>>(WIDTH*3, vector<int>(WIDTH*3));

    for (int i = 0; i < WIDTH; i++) {
        for (int j = 0; j < WIDTH ; j++) {
            for (int k = 0; k < 3; k++) {
                for (int l = 0; l < 3 ; l++) {
                    final[i*3+k][j*3+l] = map[i][j][k][l];
                }
            }
        }
    }
    
    for (int i = 0; i < final.size(); i++) {
        for (int j = 0; j < final.size(); j++) {
            if (final[i][j] == 0) {
                cout << " ";
            } else if (final[i][j] == 1) {
                cout << "█";
            } else {
                cout << ".";
            }
        }
        cout << endl;
    }
}

void draw_entropy(vector<vector<vector<tile>>> candidates) {

    for (int i = 0; i < WIDTH; i++) {
        for (int j = 0; j < WIDTH ; j++) {
            cout << candidates[i][j].size() << " ";
        }
        cout << endl;
    }
}

int main() {
reset:

    srand(time(NULL));

    vector<vector<tile>> map = vector<vector<tile>>(WIDTH, vector<tile>(WIDTH));
    vector<vector<bool>> converged = vector<vector<bool>>(WIDTH, vector<bool>(WIDTH));
    vector<vector<vector<tile>>> candidates = vector<vector<vector<tile>>>(WIDTH, vector<vector<tile>>(WIDTH));

    vector<tile> tileset = vector<tile>();

    tileset.push_back({{{0, 0, 0}, {0, 0, 0}, {0, 0, 0}}}); // empty

    tileset.push_back({{{0, 1, 0}, {1, 1, 1}, {0, 1, 0}}}); // full
    tileset.push_back({{{0, 0, 0}, {0, 1, 1}, {0, 0, 0}}}); // right
    tileset.push_back({{{0, 0, 0}, {1, 1, 0}, {0, 0, 0}}}); // left
    tileset.push_back({{{0, 1, 0}, {0, 1, 0}, {0, 0, 0}}}); // up
    tileset.push_back({{{0, 0, 0}, {0, 1, 0}, {0, 1, 0}}}); // down
    tileset.push_back({{{0, 1, 0}, {1, 1, 0}, {0, 0, 0}}}); // up_left
    tileset.push_back({{{0, 1, 0}, {0, 1, 1}, {0, 0, 0}}}); // up_right
    tileset.push_back({{{0, 0, 0}, {1, 1, 0}, {0, 1, 0}}}); // down_left
    tileset.push_back({{{0, 0, 0}, {0, 1, 1}, {0, 1, 0}}}); // down_right

    tileset.push_back({{{0, 2, 0}, {2, 2, 2}, {0, 2, 0}}}); // full_2
    tileset.push_back({{{0, 0, 0}, {0, 2, 2}, {0, 0, 0}}}); // right_2
    tileset.push_back({{{0, 0, 0}, {2, 2, 0}, {0, 0, 0}}}); // left_2
    tileset.push_back({{{0, 2, 0}, {0, 2, 0}, {0, 0, 0}}}); // up_2
    tileset.push_back({{{0, 0, 0}, {0, 2, 0}, {0, 2, 0}}}); // down_2
    tileset.push_back({{{0, 2, 0}, {2, 2, 0}, {0, 0, 0}}}); // up_left_2
    tileset.push_back({{{0, 2, 0}, {0, 2, 2}, {0, 0, 0}}}); // up_right_2
    tileset.push_back({{{0, 0, 0}, {2, 2, 0}, {0, 2, 0}}}); // down_left_2
    tileset.push_back({{{0, 0, 0}, {0, 2, 2}, {0, 2, 0}}}); // down_right_2



    int x = rd();
    int y = rd();


    map[3][3] = tileset[1];



    for (int i = 0; i < WIDTH; i++) {
        for (int j = 0; j < WIDTH ; j++) {
            if (i == x && j == y) {
                converged[i][j] = true;
                continue;
            }
            converged[i][j] = false;
        }
    }

    int max = 0;

    while (!check_converged(converged)) {
        if (max > 100) {
            goto reset;
        }
        max++;

        for (int i = 0; i < WIDTH; i++) {
            for (int j = 0; j < WIDTH ; j++) {
                candidates[i][j].clear();
            }
        }
        for (int i = 0; i < WIDTH; i++) {
            for (int j = 0; j < WIDTH ; j++) {
                compute_entropy(tileset, map, candidates, converged, i, j);
            }
        }

        // draw_entropy(candidates);
        draw_map(map);
        cout << "------------------" << endl;

        bool foundMin = false;
        for (int k = 1; k < tileset.size(); k++) {
            if (foundMin) {
                break;
            }
            for (int i = 0; i < WIDTH; i++) {
                for (int j = 0; j < WIDTH ; j++) {
                    if (candidates[i][j].size() == k) {
                        foundMin = true;
                        if (k == 1) {
                            map[i][j] = candidates[i][j][0];
                        }
                        else {
                            int r = rand() % k;
                            map[i][j] = candidates[i][j][r];
                        }
                        converged[i][j] = true;
                    }
                }
            }
        }

    }


    draw_map(map);

    return 0;
}