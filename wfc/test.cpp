#include <iostream>
#include <vector>
#include <array>
#include <stdlib.h>


using namespace std;

typedef array<array<int, 3>, 3> tile;

int rd() {
    return rand() % 5;
}


int main() {
    srand(time(NULL));

    vector<vector<tile>> tileset = vector<vector<tile>>(5, vector<tile>(5));
    vector<vector<int>> entropies = vector<vector<int>>(5, vector<int>(5));

    tile empty = {{{0, 0, 0}, {0, 0, 0}, {0, 0, 0}}};
    tile full = {{{0, 1, 0}, {1, 1, 1}, {0, 1, 0}}};
    tile right = {{{0, 0, 0}, {0, 1, 1}, {0, 0, 0}}};
    tile left = {{{0, 0, 0}, {1, 1, 0}, {0, 0, 0}}};
    tile up = {{{0, 1, 0}, {0, 1, 0}, {0, 0, 0}}};
    tile down = {{{0, 0, 0}, {0, 1, 0}, {0, 1, 0}}};
    tile up_left = {{{0, 1, 0}, {1, 1, 0}, {0, 0, 0}}};
    tile up_right = {{{0, 1, 0}, {0, 1, 1}, {0, 0, 0}}};
    tile down_left = {{{0, 0, 0}, {1, 1, 0}, {0, 1, 0}}};
    tile down_right = {{{0, 0, 0}, {0, 1, 1}, {0, 1, 0}}};

    tileset[rd()][rd()] = full;

    for (int i = 0; i < tileset.size(); i++) {
        for (int j = 0; j < tileset[i].size(); j++) {
            if (tileset[i][j].empty()) {
                if (i == 0 && j == 0) {
                    tileset[i][j] = down_right;
                } else if (i == 0 && j == 4) {
                    tileset[i][j] = down_left;
                } else if (i == 4 && j == 0) {
                    tileset[i][j] = up_right;
                } else if (i == 4 && j == 4) {
                    tileset[i][j] = up_left;
                } else if (i == 0) {
                    tileset[i][j] = down;
                } else if (i == 4) {
                    tileset[i][j] = up;
                } else if (j == 0) {
                    tileset[i][j] = right;
                } else if (j == 4) {
                    tileset[i][j] = left;
                } else {
                    tileset[i][j] = empty;
                }
            }
        }
    }






    return 0;
}