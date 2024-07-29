RAW_RUBRICS = {'german': '''1 point: E ×15, N ×9, S ×7, I ×6, R ×6, T ×6, U ×6, A ×5, D ×4
2 points: H ×4, G ×3, L ×3, O ×3
3 points: M ×4, B ×2, W ×1, Z ×1
4 points: C ×2, F ×2, K ×2, P ×1
6 points: Ä ×1, J ×1, Ü ×1, V ×1
8 points: Ö ×1, X ×1
10 points: Q ×1, Y ×1''', 'slovenian': '''1 point: E ×11, A ×10, I ×9, O ×8, N ×7, R ×6, S ×6, J ×4, L ×4, T ×4
2 points: D ×4, V ×4
3 points: K ×3, M ×2, P ×2, U ×2
4 points: B ×2, G ×2, Z ×2
5 points: Č ×1, H ×1
6 points: Š ×1
8 points: C ×1
10 points: F ×1, Ž ×1''', 'bulgarian': '''1 point: А ×9, О ×9, Е ×8, И ×8, Т ×5, Н ×4, П ×4, Р ×4, С ×4
2 points: В ×4, Д ×4, М ×4, Б ×3, К ×3, Л ×3
3 points: Г ×3, Ъ ×2
4 points: Ж ×2, З ×2
5 points: У ×3, Ч ×2, Я ×2, Й ×1, Х ×1
8 points: Ц ×1, Ш ×1, Ю ×1
10 points: Ф ×1, Щ ×1, Ь ×1''', 'lithuanian': '''1 point: I ×13, A ×12, S ×8, O ×6, T ×6, E ×5, N ×5, R ×5, K ×4, U ×4
2 points: D ×3, L ×3, M ×3, B ×1
3 points: P ×3
4 points: Ė ×2, G ×2, J ×2, V ×2
5 points: Š ×1, Y ×1
6 points: Ų ×1, Ž ×1
8 points: Ą ×1, Č ×1, Į ×1, Ū ×1
10 points: C ×1, Ę ×1, F ×1, H ×1, Z ×1''', 'russian': '''1 point: О ×10, А ×8, Е ×8, И ×5, Н ×5, Р ×5, С ×5, Т ×5, В ×4
2 points: Д ×4, К ×4, Л ×4, П ×4, У ×4, М ×3
3 points: Б ×2, Г ×2, Ь ×2, Я ×2, Ё ×1
4 points: Ы ×2, Й ×1
5 points: З ×2, Ж ×1, Х ×1, Ц ×1, Ч ×1
8 points: Ш ×1, Э ×1, Ю ×1
10 points: Ф ×1, Щ ×1, Ъ ×1''', 'french': '''1 point: E ×15, A ×9, I ×8, N ×6, O ×6, R ×6, S ×6, T ×6, U ×6, L ×5
2 points: D ×3, M ×3, G ×2
3 points: B ×2, C ×2, P ×2
4 points: F ×2, H ×2, V ×2
8 points: J ×1, Q ×1
10 points: K ×1, W ×1, X ×1, Y ×1, Z ×1''', 'english': '''1 point: E ×12, A ×9, I ×9, O ×8, N ×6, R ×6, T ×6, L ×4, S ×4, U ×4
2 points: D ×4, G ×3
3 points: B ×2, C ×2, M ×2, P ×2
4 points: F ×2, H ×2, V ×2, W ×2, Y ×2
5 points: K ×1
8 points: J ×1, X ×1
10 points: Q ×1, Z ×1''', 'spanish': '''1 point: A ×11, E ×11, O ×8, S ×7, I ×6, U ×6, N ×5, L ×4, R ×4, T ×4
2 points: C ×4, D ×4, G ×2
3 points: B ×3, M ×3, P ×2
4 points: F ×2, H ×2, V ×2, Y ×1
6 points: J ×2
8 points: K ×1, LL ×1, Ñ ×1, Q ×1, RR ×1, W ×1, X ×1
10 points: Z ×1''', 'italian': '''1 point: O ×15, A ×14, I ×12, E ×11
2 points: C ×6, R ×6, S ×6, T ×6
3 points: L ×5, M ×5, N ×5, U ×5
5 points: B ×3, D ×3, F ×3, P ×3, V ×3
8 points: G ×2, H ×2, Z ×2
10 points: Q ×1''', 'dutch': '''1 point: E ×18, N ×10, A ×6, O ×6, I ×4
2 points: D ×5, R ×5, S ×5, T ×5
3 points: G ×3, K ×3, L ×3, M ×3, B ×2, P ×2
4 points: U ×3, F ×2, H ×2, J ×2, V ×2, Z ×2
5 points: C ×2, W ×2
8 points: X ×1, Y ×1
10 points: Q ×1''', 'croatian': '''1 point: A ×11, I ×10, E ×9, O ×9, N ×6, R ×5, S ×5, T ×5, J ×4, U ×4
2 points: K ×3, M ×3, P ×3, V ×3
3 points: D ×3, G ×2, L ×2, Z ×2, B ×1, Č ×1
4 points: C ×1, H ×1, LJ ×1, NJ ×1, Š ×1, Ž ×1
5 points: Ć ×1
8 points: F ×1
10 points: DŽ ×1, Đ ×1''', 'polish': '''1 point: A ×9, I ×8, E ×7, O ×6, N ×5, Z ×5, R ×4, S ×4, W ×4
2 points: Y ×4, C ×3, D ×3, K ×3, L ×3, M ×3, P ×3, T ×3
3 points: B ×2, G ×2, H ×2, J ×2, Ł ×2, U ×2
5 points: Ą ×1, Ę ×1, F ×1, Ó ×1, Ś ×1, Ż ×1
6 points: Ć ×1
7 points: Ń ×1
9 points: Ź ×1''', }
