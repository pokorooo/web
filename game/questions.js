// 質問データベース
const questionsDatabase = {
    easy: [
        {
            id: 1,
            category: "歴史",
            question: "日本の初代内閣総理大臣は誰でしょうか？",
            options: {
                A: "伊藤博文",
                B: "大久保利通",
                C: "西郷隆盛",
                D: "坂本龍馬"
            },
            correct: "A"
        },
        {
            id: 2,
            category: "科学",
            question: "水の化学式はどれでしょうか？",
            options: {
                A: "CO2",
                B: "H2O",
                C: "NaCl",
                D: "O2"
            },
            correct: "B"
        },
        {
            id: 3,
            category: "地理",
            question: "世界で一番高い山は何でしょうか？",
            options: {
                A: "富士山",
                B: "キリマンジャロ",
                C: "エベレスト",
                D: "マッターホルン"
            },
            correct: "C"
        },
        {
            id: 4,
            category: "映画",
            question: "スタジオジブリの代表作「となりのトトロ」の監督は誰でしょうか？",
            options: {
                A: "宮崎駿",
                B: "高畑勲",
                C: "押井守",
                D: "細田守"
            },
            correct: "A"
        },
        {
            id: 5,
            category: "音楽",
            question: "クラシック音楽の「運命」を作曲したのは誰でしょうか？",
            options: {
                A: "モーツァルト",
                B: "バッハ",
                C: "ベートーヴェン",
                D: "ショパン"
            },
            correct: "C"
        },
        {
            id: 6,
            category: "スポーツ",
            question: "サッカーW杯は何年に一度開催されるでしょうか？",
            options: {
                A: "2年",
                B: "3年",
                C: "4年",
                D: "5年"
            },
            correct: "C"
        },
        {
            id: 7,
            category: "文学",
            question: "「吾輩は猫である」の作者は誰でしょうか？",
            options: {
                A: "森鷗外",
                B: "夏目漱石",
                C: "芥川龍之介",
                D: "太宰治"
            },
            correct: "B"
        },
        {
            id: 8,
            category: "技術",
            question: "インターネットでよく使われる「WWW」の略称の意味は？",
            options: {
                A: "World Wide Web",
                B: "World Wide Window",
                C: "World Wide Work",
                D: "World Wide Wireless"
            },
            correct: "A"
        },
        {
            id: 25,
            category: "歴史",
            question: "第二次世界大戦が終了したのは何年でしょうか？",
            options: {
                A: "1944年",
                B: "1945年",
                C: "1946年",
                D: "1947年"
            },
            correct: "B"
        },
        {
            id: 26,
            category: "科学",
            question: "人間の体温の平均は約何度でしょうか？",
            options: {
                A: "35度",
                B: "36度",
                C: "37度",
                D: "38度"
            },
            correct: "C"
        },
        {
            id: 27,
            category: "地理",
            question: "日本の首都はどこでしょうか？",
            options: {
                A: "大阪",
                B: "京都",
                C: "東京",
                D: "名古屋"
            },
            correct: "C"
        },
        {
            id: 28,
            category: "映画",
            question: "映画「タイタニック」の主演女優は誰でしょうか？",
            options: {
                A: "ケイト・ウィンスレット",
                B: "ジュリア・ロバーツ",
                C: "メグ・ライアン",
                D: "サンドラ・ブロック"
            },
            correct: "A"
        },
        {
            id: 29,
            category: "音楽",
            question: "ピアノの鍵盤で白い鍵は何個あるでしょうか？",
            options: {
                A: "48個",
                B: "50個",
                C: "52個",
                D: "54個"
            },
            correct: "C"
        },
        {
            id: 30,
            category: "スポーツ",
            question: "野球で1チームの選手は何人でしょうか？",
            options: {
                A: "8人",
                B: "9人",
                C: "10人",
                D: "11人"
            },
            correct: "B"
        },
        {
            id: 31,
            category: "文学",
            question: "「桃太郎」で桃太郎のお供になった動物でないのはどれでしょうか？",
            options: {
                A: "犬",
                B: "猿",
                C: "キジ",
                D: "カラス"
            },
            correct: "D"
        },
        {
            id: 32,
            category: "技術",
            question: "パソコンのキーボードで一般的に使われる配列は何でしょうか？",
            options: {
                A: "ABCDEF配列",
                B: "QWERTY配列",
                C: "あいうえお配列",
                D: "12345配列"
            },
            correct: "B"
        },
        {
            id: 33,
            category: "歴史",
            question: "江戸時代の徳川将軍は全部で何人いたでしょうか？",
            options: {
                A: "13人",
                B: "14人",
                C: "15人",
                D: "16人"
            },
            correct: "C"
        },
        {
            id: 34,
            category: "科学",
            question: "太陽系で最も大きな惑星はどれでしょうか？",
            options: {
                A: "土星",
                B: "木星",
                C: "海王星",
                D: "天王星"
            },
            correct: "B"
        },
        {
            id: 35,
            category: "地理",
            question: "北海道で一番大きな都市はどこでしょうか？",
            options: {
                A: "函館",
                B: "旭川",
                C: "札幌",
                D: "小樽"
            },
            correct: "C"
        },
        {
            id: 36,
            category: "動物",
            question: "ペンギンは何の仲間でしょうか？",
            options: {
                A: "魚類",
                B: "哺乳類",
                C: "鳥類",
                D: "爬虫類"
            },
            correct: "C"
        },
        {
            id: 37,
            category: "食べ物",
            question: "寿司で「トロ」と呼ばれるのは何の魚でしょうか？",
            options: {
                A: "サーモン",
                B: "マグロ",
                C: "ヒラメ",
                D: "タイ"
            },
            correct: "B"
        },
        {
            id: 38,
            category: "アニメ",
            question: "アニメ「ドラえもん」で、のび太の苗字は何でしょうか？",
            options: {
                A: "野比",
                B: "野田",
                C: "野村",
                D: "野口"
            },
            correct: "A"
        },
        {
            id: 39,
            category: "国語",
            question: "「春夏秋冬」の読み方はどれでしょうか？",
            options: {
                A: "はるなつあきふゆ",
                B: "しゅんかしゅうとう",
                C: "はるなつあきとう",
                D: "しゅんげしゅうとう"
            },
            correct: "B"
        },
        {
            id: 40,
            category: "数学",
            question: "円周率πの最初の3つの数字は何でしょうか？",
            options: {
                A: "3.15",
                B: "3.14",
                C: "3.13",
                D: "3.16"
            },
            correct: "B"
        },
        {
            id: 73,
            category: "色",
            question: "信号機の色の順番は上から何色でしょうか？",
            options: {
                A: "赤、黄、青",
                B: "青、黄、赤",
                C: "赤、青、黄",
                D: "黄、赤、青"
            },
            correct: "A"
        },
        {
            id: 74,
            category: "季節",
            question: "日本で桜が咲くのは一般的に何月でしょうか？",
            options: {
                A: "3月",
                B: "4月",
                C: "5月",
                D: "6月"
            },
            correct: "B"
        },
        {
            id: 75,
            category: "交通",
            question: "日本で車は道路のどちら側を走るでしょうか？",
            options: {
                A: "左側",
                B: "右側",
                C: "真ん中",
                D: "どちらでもよい"
            },
            correct: "A"
        },
        {
            id: 76,
            category: "時間",
            question: "1日は何時間でしょうか？",
            options: {
                A: "23時間",
                B: "24時間",
                C: "25時間",
                D: "26時間"
            },
            correct: "B"
        }
    ],
    normal: [
        {
            id: 9,
            category: "歴史",
            question: "明治維新が起こったのは西暦何年でしょうか？",
            options: {
                A: "1867年",
                B: "1868年",
                C: "1869年",
                D: "1870年"
            },
            correct: "B"
        },
        {
            id: 10,
            category: "科学",
            question: "光の速度は約何km/秒でしょうか？",
            options: {
                A: "30万km/秒",
                B: "300万km/秒",
                C: "3000万km/秒",
                D: "3億km/秒"
            },
            correct: "A"
        },
        {
            id: 11,
            category: "地理",
            question: "南米大陸で最も長い川はどれでしょうか？",
            options: {
                A: "ナイル川",
                B: "ミシシッピ川",
                C: "アマゾン川",
                D: "長江"
            },
            correct: "C"
        },
        {
            id: 12,
            category: "映画",
            question: "アカデミー賞で作品賞を受賞した日本映画はどれでしょうか？",
            options: {
                A: "七人の侍",
                B: "羅生門",
                C: "パラサイト",
                D: "該当なし"
            },
            correct: "D"
        },
        {
            id: 13,
            category: "音楽",
            question: "ピアノの鍵盤は白鍵と黒鍵を合わせて何個でしょうか？",
            options: {
                A: "76個",
                B: "82個",
                C: "88個",
                D: "96個"
            },
            correct: "C"
        },
        {
            id: 14,
            category: "スポーツ",
            question: "オリンピックの五輪マークの色に含まれないのはどれでしょうか？",
            options: {
                A: "紫",
                B: "青",
                C: "黄",
                D: "緑"
            },
            correct: "A"
        },
        {
            id: 15,
            category: "文学",
            question: "ノーベル文学賞を受賞した日本人作家は何人でしょうか？（2023年時点）",
            options: {
                A: "1人",
                B: "2人",
                C: "3人",
                D: "4人"
            },
            correct: "C"
        },
        {
            id: 16,
            category: "技術",
            question: "プログラミング言語「JavaScript」が最初に開発されたのはいつでしょうか？",
            options: {
                A: "1993年",
                B: "1995年",
                C: "1997年",
                D: "1999年"
            },
            correct: "B"
        },
        {
            id: 41,
            category: "歴史",
            question: "平安時代の都は現在のどこでしょうか？",
            options: {
                A: "東京",
                B: "大阪",
                C: "京都",
                D: "奈良"
            },
            correct: "C"
        },
        {
            id: 42,
            category: "科学",
            question: "地球の衛星である月までの距離は約何万kmでしょうか？",
            options: {
                A: "約28万km",
                B: "約32万km",
                C: "約38万km",
                D: "約42万km"
            },
            correct: "C"
        },
        {
            id: 43,
            category: "地理",
            question: "世界で最も面積が大きい国はどこでしょうか？",
            options: {
                A: "アメリカ",
                B: "中国",
                C: "カナダ",
                D: "ロシア"
            },
            correct: "D"
        },
        {
            id: 44,
            category: "映画",
            question: "映画「君の名は。」の監督は誰でしょうか？",
            options: {
                A: "宮崎駿",
                B: "新海誠",
                C: "細田守",
                D: "庵野秀明"
            },
            correct: "B"
        },
        {
            id: 45,
            category: "音楽",
            question: "オーケストラでリーダーを務める楽器は何でしょうか？",
            options: {
                A: "フルート",
                B: "トランペット",
                C: "バイオリン",
                D: "ピアノ"
            },
            correct: "C"
        },
        {
            id: 46,
            category: "スポーツ",
            question: "夏季オリンピックで最初に開催された競技はどれでしょうか？",
            options: {
                A: "陸上競技",
                B: "水泳",
                C: "体操",
                D: "テニス"
            },
            correct: "A"
        },
        {
            id: 47,
            category: "文学",
            question: "「源氏物語」の作者は誰でしょうか？",
            options: {
                A: "清少納言",
                B: "紫式部",
                C: "和泉式部",
                D: "小野小町"
            },
            correct: "B"
        },
        {
            id: 48,
            category: "技術",
            question: "インターネットの「http」の「h」は何の略でしょうか？",
            options: {
                A: "Home",
                B: "High",
                C: "Hyper",
                D: "Host"
            },
            correct: "C"
        },
        {
            id: 49,
            category: "動物",
            question: "世界最大の哺乳動物は何でしょうか？",
            options: {
                A: "アフリカゾウ",
                B: "キリン",
                C: "シロナガスクジラ",
                D: "カバ"
            },
            correct: "C"
        },
        {
            id: 50,
            category: "食べ物",
            question: "イタリア料理の「カルボナーラ」に使われる主なチーズは何でしょうか？",
            options: {
                A: "モッツァレラ",
                B: "パルミジャーノ",
                C: "ゴルゴンゾーラ",
                D: "リコッタ"
            },
            correct: "B"
        },
        {
            id: 51,
            category: "アニメ",
            question: "アニメ「ワンピース」の主人公の名前は何でしょうか？",
            options: {
                A: "ルフィ",
                B: "ナルト",
                C: "悟空",
                D: "一護"
            },
            correct: "A"
        },
        {
            id: 52,
            category: "国語",
            question: "「雨降って地固まる」の意味に最も近いことわざはどれでしょうか？",
            options: {
                A: "転んでもただでは起きぬ",
                B: "災い転じて福となす",
                C: "明けない夜はない",
                D: "七転び八起き"
            },
            correct: "B"
        },
        {
            id: 53,
            category: "数学",
            question: "正三角形の内角の和は何度でしょうか？",
            options: {
                A: "120度",
                B: "150度",
                C: "180度",
                D: "360度"
            },
            correct: "C"
        },
        {
            id: 54,
            category: "世界史",
            question: "古代エジプトのピラミッドがある場所はどこでしょうか？",
            options: {
                A: "カイロ",
                B: "ギザ",
                C: "アレキサンドリア",
                D: "ルクソール"
            },
            correct: "B"
        },
        {
            id: 55,
            category: "宇宙",
            question: "太陽系で最も小さな惑星はどれでしょうか？",
            options: {
                A: "水星",
                B: "金星",
                C: "火星",
                D: "冥王星"
            },
            correct: "A"
        },
        {
            id: 56,
            category: "建築",
            question: "フランス・パリにある有名な塔の名前は何でしょうか？",
            options: {
                A: "ピサの斜塔",
                B: "エッフェル塔",
                C: "東京タワー",
                D: "CNタワー"
            },
            correct: "B"
        },
        {
            id: 77,
            category: "健康",
            question: "人間の心臓は1分間に平均何回拍動するでしょうか？",
            options: {
                A: "約50回",
                B: "約70回",
                C: "約90回",
                D: "約110回"
            },
            correct: "B"
        },
        {
            id: 78,
            category: "料理",
            question: "味噌汁によく使われる「だし」の材料でないのはどれでしょうか？",
            options: {
                A: "昆布",
                B: "かつお節",
                C: "しいたけ",
                D: "わかめ"
            },
            correct: "D"
        },
        {
            id: 79,
            category: "植物",
            question: "花粉症の原因として有名な植物はどれでしょうか？",
            options: {
                A: "バラ",
                B: "チューリップ",
                C: "スギ",
                D: "ひまわり"
            },
            correct: "C"
        },
        {
            id: 80,
            category: "天気",
            question: "雲の種類で「積乱雲」が発生しやすい天気は何でしょうか？",
            options: {
                A: "雪",
                B: "雨",
                C: "雷雨",
                D: "霧"
            },
            correct: "C"
        }
    ],
    hard: [
        {
            id: 17,
            category: "歴史",
            question: "江戸幕府の第3代将軍徳川家光が発令した鎖国令は何と呼ばれるでしょうか？",
            options: {
                A: "寛永令",
                B: "島原の乱令",
                C: "海禁令",
                D: "参勤交代令"
            },
            correct: "A"
        },
        {
            id: 18,
            category: "科学",
            question: "DNA の二重らせん構造を発見してノーベル賞を受賞した科学者は誰でしょうか？",
            options: {
                A: "メンデル",
                B: "ダーウィン",
                C: "ワトソンとクリック",
                D: "パスツール"
            },
            correct: "C"
        },
        {
            id: 19,
            category: "地理",
            question: "世界で最も塩分濃度が高い湖はどれでしょうか？",
            options: {
                A: "死海",
                B: "カスピ海",
                C: "アラル海",
                D: "ドン・ファン池"
            },
            correct: "D"
        },
        {
            id: 20,
            category: "映画",
            question: "映画「市民ケーン」の監督で主演も務めた人物は誰でしょうか？",
            options: {
                A: "チャーリー・チャップリン",
                B: "オーソン・ウェルズ",
                C: "アルフレッド・ヒッチコック",
                D: "ビリー・ワイルダー"
            },
            correct: "B"
        },
        {
            id: 21,
            category: "音楽",
            question: "バッハの「平均律クラヴィーア曲集」は全部で何曲あるでしょうか？",
            options: {
                A: "24曲",
                B: "48曲",
                C: "72曲",
                D: "96曲"
            },
            correct: "B"
        },
        {
            id: 22,
            category: "スポーツ",
            question: "テニスの四大大会（グランドスラム）で芝のコートで行われるのはどれでしょうか？",
            options: {
                A: "全豪オープン",
                B: "全仏オープン",
                C: "ウィンブルドン",
                D: "全米オープン"
            },
            correct: "C"
        },
        {
            id: 23,
            category: "文学",
            question: "ドストエフスキーの小説「カラマーゾフの兄弟」の兄弟は何人でしょうか？",
            options: {
                A: "3人",
                B: "4人",
                C: "5人",
                D: "6人"
            },
            correct: "B"
        },
        {
            id: 24,
            category: "技術",
            question: "インターネットの基盤となるTCP/IPプロトコルが標準化されたのはいつでしょうか？",
            options: {
                A: "1973年",
                B: "1981年",
                C: "1989年",
                D: "1991年"
            },
            correct: "B"
        },
        {
            id: 57,
            category: "歴史",
            question: "室町幕府の初代将軍足利尊氏が南北朝の動乱で対立した天皇は誰でしょうか？",
            options: {
                A: "後醍醐天皇",
                B: "光厳天皇",
                C: "光明天皇",
                D: "崇光天皇"
            },
            correct: "A"
        },
        {
            id: 58,
            category: "科学",
            question: "量子力学において、電子の位置と運動量を同時に正確に測定できないという原理は何でしょうか？",
            options: {
                A: "パウリの排他原理",
                B: "ハイゼンベルクの不確定性原理",
                C: "シュレディンガーの波動方程式",
                D: "プランクの量子仮説"
            },
            correct: "B"
        },
        {
            id: 59,
            category: "地理",
            question: "アンデス山脈で最も高い山「アコンカグア」がある国はどこでしょうか？",
            options: {
                A: "チリ",
                B: "ペルー",
                C: "アルゼンチン",
                D: "ボリビア"
            },
            correct: "C"
        },
        {
            id: 60,
            category: "映画",
            question: "映画「8½」や「道」で知られるイタリアの巨匠映画監督は誰でしょうか？",
            options: {
                A: "ルキノ・ヴィスコンティ",
                B: "フェデリコ・フェリーニ",
                C: "ミケランジェロ・アントニオーニ",
                D: "ヴィットリオ・デ・シーカ"
            },
            correct: "B"
        },
        {
            id: 61,
            category: "音楽",
            question: "ショパンの「革命のエチュード」の正式な作品番号は何でしょうか？",
            options: {
                A: "Op.10 No.12",
                B: "Op.25 No.11",
                C: "Op.10 No.4",
                D: "Op.25 No.12"
            },
            correct: "A"
        },
        {
            id: 62,
            category: "スポーツ",
            question: "陸上競技の十種競技で、2日目の最後に行われる種目は何でしょうか？",
            options: {
                A: "1500m走",
                B: "やり投げ",
                C: "棒高跳び",
                D: "円盤投げ"
            },
            correct: "A"
        },
        {
            id: 63,
            category: "文学",
            question: "プルーストの長編小説「失われた時を求めて」は全何巻でしょうか？",
            options: {
                A: "5巻",
                B: "6巻",
                C: "7巻",
                D: "8巻"
            },
            correct: "C"
        },
        {
            id: 64,
            category: "技術",
            question: "コンピューターの「ノイマン型アーキテクチャ」で提唱された基本概念でないのはどれでしょうか？",
            options: {
                A: "プログラム内蔵方式",
                B: "二進法による計算",
                C: "逐次実行",
                D: "並列処理"
            },
            correct: "D"
        },
        {
            id: 65,
            category: "哲学",
            question: "「我思う、ゆえに我あり」で有名なデカルトの主著は何でしょうか？",
            options: {
                A: "方法序説",
                B: "省察録",
                C: "哲学原理",
                D: "情念論"
            },
            correct: "A"
        },
        {
            id: 66,
            category: "美術",
            question: "ピカソの代表作「ゲルニカ」が描かれたきっかけとなった出来事は何でしょうか？",
            options: {
                A: "第一次世界大戦",
                B: "スペイン内戦",
                C: "第二次世界大戦",
                D: "ファシスト政権の台頭"
            },
            correct: "B"
        },
        {
            id: 67,
            category: "経済",
            question: "ケインズ経済学で重視される「流動性の罠」とは何の現象でしょうか？",
            options: {
                A: "金利が下がっても投資が増えない",
                B: "物価が下がり続ける",
                C: "失業率が高止まりする",
                D: "通貨の価値が不安定になる"
            },
            correct: "A"
        },
        {
            id: 68,
            category: "物理学",
            question: "アインシュタインの一般相対性理論で説明される現象でないのはどれでしょうか？",
            options: {
                A: "重力レンズ効果",
                B: "時間の遅れ",
                C: "水星の近日点移動",
                D: "光電効果"
            },
            correct: "D"
        },
        {
            id: 69,
            category: "生物学",
            question: "遺伝子の転写調節において、プロモーターとRNAポリメラーゼの結合を助けるタンパク質を何と呼ぶでしょうか？",
            options: {
                A: "転写因子",
                B: "リプレッサー",
                C: "オペレーター",
                D: "エンハンサー"
            },
            correct: "A"
        },
        {
            id: 70,
            category: "化学",
            question: "有機化学における「SN2反応」の「S」は何を表すでしょうか？",
            options: {
                A: "Substitution（置換）",
                B: "Synthesis（合成）",
                C: "Separation（分離）",
                D: "Stereochemistry（立体化学）"
            },
            correct: "A"
        },
        {
            id: 71,
            category: "言語学",
            question: "言語系統でインド・ヨーロッパ語族に属さない言語はどれでしょうか？",
            options: {
                A: "ヒンディー語",
                B: "ペルシア語",
                C: "フィンランド語",
                D: "ロシア語"
            },
            correct: "C"
        },
        {
            id: 72,
            category: "考古学",
            question: "エジプトのツタンカーメン王の墓を発見した考古学者は誰でしょうか？",
            options: {
                A: "シュリーマン",
                B: "エヴァンス",
                C: "カーター",
                D: "ペトリー"
            },
            correct: "C"
        },
        {
            id: 81,
            category: "数学",
            question: "微分積分学を発明した数学者は誰でしょうか（複数名）？",
            options: {
                A: "ニュートンとライプニッツ",
                B: "オイラーとガウス",
                C: "ピタゴラスとユークリッド",
                D: "デカルトとフェルマー"
            },
            correct: "A"
        },
        {
            id: 82,
            category: "医学",
            question: "ペニシリンを発見したイギリスの細菌学者は誰でしょうか？",
            options: {
                A: "ジェンナー",
                B: "フレミング",
                C: "パスツール",
                D: "コッホ"
            },
            correct: "B"
        },
        {
            id: 83,
            category: "天文学",
            question: "ハッブル宇宙望遠鏡が発見した現象で宇宙の加速膨張の証拠となったのは何でしょうか？",
            options: {
                A: "ブラックホール",
                B: "暗黒物質",
                C: "暗黒エネルギー",
                D: "重力波"
            },
            correct: "C"
        },
        {
            id: 84,
            category: "社会学",
            question: "「プロテスタンティズムの倫理と資本主義の精神」を書いたドイツの社会学者は誰でしょうか？",
            options: {
                A: "マックス・ヴェーバー",
                B: "エミール・デュルケーム",
                C: "カール・マルクス",
                D: "ゲオルク・ジンメル"
            },
            correct: "A"
        }
    ]
};

// ローカルストレージのキー
const STORAGE_KEYS = {
    CUSTOM_QUESTIONS: 'quizGame_customQuestions',
    HIGH_SCORES: 'quizGame_highScores',
    PLAYER_STATS: 'quizGame_playerStats'
};

// カスタム質問を取得
function getCustomQuestions() {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    return stored ? JSON.parse(stored) : { easy: [], normal: [], hard: [] };
}

// カスタム質問を保存
function saveCustomQuestions(questions) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUESTIONS, JSON.stringify(questions));
}

// 全質問を取得（デフォルト + カスタム）
function getAllQuestions() {
    const customQuestions = getCustomQuestions();
    return {
        easy: [...questionsDatabase.easy, ...customQuestions.easy],
        normal: [...questionsDatabase.normal, ...customQuestions.normal],
        hard: [...questionsDatabase.hard, ...customQuestions.hard]
    };
}

// 指定した難易度の質問をランダムに取得
function getRandomQuestions(difficulty, count = 10) {
    const allQuestions = getAllQuestions();
    const questions = allQuestions[difficulty];
    
    if (questions.length === 0) {
        // 指定した難易度に質問がない場合は、他の難易度から取得
        const allDifficulties = ['easy', 'normal', 'hard'];
        const availableQuestions = [];
        
        for (const diff of allDifficulties) {
            availableQuestions.push(...allQuestions[diff]);
        }
        
        return shuffleArray(availableQuestions).slice(0, count);
    }
    
    // 質問数が足りない場合は他の難易度から補完
    if (questions.length < count) {
        const otherQuestions = [];
        const allDifficulties = ['easy', 'normal', 'hard'].filter(d => d !== difficulty);
        
        for (const diff of allDifficulties) {
            otherQuestions.push(...allQuestions[diff]);
        }
        
        const combinedQuestions = [...questions, ...otherQuestions];
        return shuffleArray(combinedQuestions).slice(0, count);
    }
    
    return shuffleArray(questions).slice(0, count);
}

// 配列をシャッフル
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// カテゴリ一覧を取得
function getCategories() {
    return ["歴史", "科学", "映画", "音楽", "スポーツ", "地理", "文学", "技術", "動物", "食べ物", "アニメ", "国語", "数学", "世界史", "宇宙", "建築", "哲学", "美術", "経済", "物理学", "生物学", "化学", "言語学", "考古学", "色", "季節", "交通", "時間", "健康", "料理", "植物", "天気", "医学", "天文学", "社会学"];
}

// 新しい質問を追加
function addCustomQuestion(category, difficulty, question, options, correct) {
    const customQuestions = getCustomQuestions();
    const newId = Date.now(); // 簡単なID生成
    
    const newQuestion = {
        id: newId,
        category,
        question,
        options,
        correct,
        custom: true
    };
    
    customQuestions[difficulty].push(newQuestion);
    saveCustomQuestions(customQuestions);
    
    return newQuestion;
}

// 質問を削除
function deleteQuestion(id, difficulty) {
    const customQuestions = getCustomQuestions();
    customQuestions[difficulty] = customQuestions[difficulty].filter(q => q.id !== id);
    saveCustomQuestions(customQuestions);
}

// ハイスコアを保存
function saveHighScore(score, difficulty, correctCount, totalQuestions) {
    const highScores = getHighScores();
    const newScore = {
        score,
        difficulty,
        correctCount,
        totalQuestions,
        date: new Date().toISOString(),
        accuracy: Math.round((correctCount / totalQuestions) * 100)
    };
    
    highScores.push(newScore);
    // 最新10件のみ保持
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(10);
    
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(highScores));
}

// ハイスコアを取得
function getHighScores() {
    const stored = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    return stored ? JSON.parse(stored) : [];
}