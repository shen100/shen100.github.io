const concepts = [
    {
        name: '半导体设备',
        stocks: [
            '北方华创', // 综合设备平台，沉积/刻蚀/清洗/热处理[reference:0][reference:1]
            '中微公司', // 刻蚀机（介质刻蚀、导体刻蚀）[reference:2][reference:3]
            '盛美上海', // 单片式清洗设备[reference:4]
            '拓荆科技', // PECVD沉积设备[reference:5][reference:6]
            '华海清科', // CMP化学机械抛光设备[reference:7]
            '长川科技', // 存储/SoC测试设备[reference:8][reference:9]
            '华峰测控', // 模拟/功率半导体测试仪器[reference:10][reference:11]
            '芯源微', // 涂胶显影设备[reference:12][reference:13]
            '至纯科技', // 湿法清洗、高纯流体输送系统
            '中科飞测', // 晶圆量检测设备[reference:14][reference:15]
            '精测电子', // 前道光学检测、后道测试设备[reference:16][reference:17]
            '精智达', // 存储芯片测试设备
            '正帆科技', // 特种工艺气体、化学品输送系统
            '京仪装备', // 半导体温控、废气处理设备[reference:18]
            '富创精密', // 半导体设备精密零部件[reference:19][reference:20]
            '屹唐股份', // 去胶、热处理&刻蚀设备龙头[reference:21][reference:22]
            '金海通', // 半导体分选设备
            '联动科技', // 功率半导体测试设备
            '微导纳米', // 薄膜沉积设备[reference:23][reference:24]
            '新莱应材', // 半导体设备零部件[reference:25][reference:26]
            '晶盛机电', // 半导体设备零部件[reference:27][reference:28]
            '英杰电气', // 半导体设备零部件[reference:29][reference:30]
            '汉钟精机' // 半导体设备零部件[reference:31][reference:32]
        ]
    },
    {
        name: '半导体材料',
        stocks: [
            '沪硅产业', // 12英寸大硅片主力供应商，国内大硅片绝对龙头[reference:33]
            '立昂微', // 硅片、功率半导体
            '西安奕材', // 半导体硅片
            '有研新材', // 高纯靶材、硅材料，央企背景半导体靶材龙头[reference:34]
            '江丰电子', // 高纯溅射靶材，A股唯一打入台积电3nm/5nm/7nm全制程供应链[reference:35]
            '安集科技', // CMP抛光液[reference:36]
            '鼎龙股份', // CMP抛光垫、光刻配套材料[reference:37][reference:38]
            '雅克科技', // 光刻胶、电子特气、前驱体材料[reference:39]
            '晶瑞电材', // 光刻胶、湿电子化学品
            '彤程新材', // KrF光刻胶、光刻配套化学品，国内KrF光刻胶龙头[reference:40]
            '江化微', // 湿电子化学品
            '华特气体', // 电子特种气体、光刻气
            '中船特气', // 电子特种气体
            '广钢气体', // 电子大宗气体[reference:41]
            '欧莱新材', // 高纯特种靶材材料
            '华海诚科', // 先进封装环氧材料（适配HBM）
            '南大光电', // ArF光刻胶、前驱体、电子特气，多赛道半导体材料龙头[reference:42]
            '飞凯材料', // 光刻胶布局完善[reference:43]
            '有研硅', // 高盈利半导体硅材料龙头[reference:44]
            '兴福电子' // 电子级磷酸[reference:45]
        ]
    },
    {
        name: 'MLCC',
        stocks: [
            '风华高科', // MLCC国内龙头，月产能行业第一，全尺寸全品类覆盖[reference:46][reference:47]
            '三环集团', // 电子陶瓷龙头，MLCC粉体+成品一体化，垂直一体化企业[reference:48][reference:49]
            '国瓷材料', // MLCC核心陶瓷粉体原材料，国内MLCC陶瓷粉体龙头[reference:50][reference:51]
            '顺络电子', // 车规MLCC、电感[reference:52]
            '达利凯普', // 射频微波高端MLCC，毛利率66%国产第一[reference:53][reference:54]
            '鸿远电子', // 军工高可靠陶瓷电容，特种陶瓷电容核心厂商[reference:55][reference:56]
            '火炬电子', // 军工特种MLCC，首批宇航级认证[reference:57][reference:58]
            '宏达电子', // 军工陶瓷电容，国内钽电容龙头[reference:59][reference:60]
            '江海股份', // 电容器，布局MLCC相关产品线[reference:61]
            '艾华集团', // 电解电容，国内第二大铝电解电容厂商[reference:62]
            '洁美科技', // MLCC离型膜[reference:63]
            '博迁新材', // MLCC镍粉[reference:64]
            '昀冢科技', // MLCC相关[reference:65]
            '利和兴' // MLCC相关[reference:66]
        ]
    },
    {
        name: '玻璃基板',
        stocks: [
            '彩虹股份', // 显示无碱玻璃基板龙头，布局半导体TGV玻璃[reference:67][reference:68][reference:69]
            '沃格光电', // TGV玻璃基板、玻璃基先进封装载板，全球少数掌握TGV全制程核心工艺并量产[reference:70][reference:71]
            '京东方A', // 面板龙头，布局玻璃基封装基板，已实现板级玻璃基封装载板试验线全自动化设备通线[reference:72][reference:73]
            'TCL科技', // 面板+显示玻璃产业链
            '凯盛科技', // 电子玻璃、超薄玻璃，产品覆盖上游玻璃基板到下游模组集成全链条[reference:74]
            '旗滨集团', // 国内规模较大的全玻璃产业集团，已展开玻璃基板研发[reference:75]
            '帝尔激光', // TGV激光微孔设备，晶圆级和面板级封装激光技术全面覆盖[reference:76]
            '五方光电', // 玻璃通孔TGV技术能力[reference:77]
            '蓝思科技', // 参与《3D封装玻璃通孔（TGV）工艺技术规范》团体标准制定[reference:78]
            '力诺药包', // 高硼硅玻璃[reference:79]
            '雷曼光电', // 玻璃基显示封装技术及商业化产品落地[reference:80]
            '通富微电', // 京东方MLED产业链核心资产协同受益[reference:81]
            '赛微电子' // 玻璃通孔（TGV）技术能力[reference:82]
        ]
    },
    {
        name: '存储芯片',
        stocks: [
            '兆易创新', // NOR Flash龙头，A股存储芯片设计龙头[reference:83][reference:84]
            '普冉股份', // NOR Flash、EEPROM，利基型存储芯片[reference:85]
            '佰维存储', // 嵌入式存储、存储模组，国内存储器模组龙头[reference:86][reference:87]
            '江波龙', // 消费/企业级存储模组，国内存储模组龙头[reference:88][reference:89]
            '德明利', // 主控芯片、存储模组[reference:90][reference:91]
            '香农芯创', // 存储分销、HBM内存供应链[reference:92]
            '北京君正', // 车规级存储芯片[reference:93][reference:94]
            '东芯股份', // 利基DRAM、SLC NAND[reference:95]
            '澜起科技', // 内存接口芯片全球龙头，DDR5世代市占率领先[reference:96][reference:97]
            '长电科技', // 国内封测龙头，3D堆叠先进封装关键环节[reference:98]
            '通富微电', // 国内封测龙头[reference:99]
            '深科技', // 存储封测
            '同有科技' // 存储系统[reference:100]
        ]
    },
    {
        name: 'CPO光通信',
        stocks: [
            '中际旭创', // 全球高速光模块龙头[reference:101][reference:102]
            '新易盛', // 海外高端光模块[reference:103][reference:104]
            '天孚通信', // 无源光器件、光引擎配套，已完成1.6T光引擎规模量产[reference:105][reference:106]
            '光迅科技', // 光模块、自研光芯片[reference:107]
            '华工科技', // 光模块、激光器芯片[reference:108]
            '光库科技', // 铌酸锂调制器、特种光器件[reference:109]
            '长飞光纤', // 光纤预制棒、特种光纤
            '亨通光电', // 光纤光缆、海缆[reference:110]
            '中天科技', // 光纤光缆、空芯光纤
            '通鼎互联', // 通信光缆
            '源杰科技', // 光芯片龙头，CW光源/EML光芯片[reference:111][reference:112]
            '长光华芯', // 100G EML/VCSEL光芯片[reference:113]
            '仕佳光子', // CW光源，75-1000mW全功率CW光源矩阵[reference:114]
            '剑桥科技', // LPO/CPO光模块[reference:115]
            '太辰光', // MPO连接器，CPO光互联核心器件[reference:116]
            '罗博特科', // CPO相关[reference:117][reference:118]
            '炬光科技', // CPO相关[reference:119]
            '杰普特' // CPO四小龙[reference:120]
        ]
    },
    {
        name: 'PCB电路板',
        stocks: [
            '沪电股份', // AI服务器高速PCB龙头，英伟达核心供应商[reference:121][reference:122]
            '深南电路', // 高端通信PCB、IC封装基板，数通PCB+封装基板内资领军[reference:123][reference:124]
            '胜宏科技', // 服务器显卡PCB、高阶HDI，深度参与英伟达Scale-up互联定义[reference:125][reference:126]
            '景旺电子', // 高端多层PCB[reference:127]
            '鹏鼎控股', // FPC柔性线路板，全球PCB营收排名第一[reference:128]
            '生益科技', // PCB上游覆铜板龙头[reference:129]
            '生益电子', // AI高端PCB[reference:130][reference:131]
            '东山精密', // AI服务器PCB龙头[reference:132][reference:133]
            '兴森科技', // PCB[reference:134]
            '宏昌电子', // 环氧树脂龙头，PPO是AI高端PCB核心原料[reference:135]
            '金安国纪', // PCB[reference:136]
            '东方材料', // PCB电子油墨[reference:137]
            '大族数控', // PCB设备[reference:138]
            '芯碁微装' // PCB设备[reference:139]
        ]
    },
    {
        name: '先进封装',
        stocks: [
            '长电科技', // 国内封测龙头，XDFOI Chiplet平台，HBM/2.5D/3D堆叠、Fan‑out扇出[reference:2][reference:8]
            '通富微电', // GPU先进封装主力，深度绑定AMD，FC‑BGA、HBM堆叠封装[reference:2][reference:8]
            '华天科技', // 存储、功率器件先进封测，Fan‑out、晶圆级封装布局[reference:4]
            '甬矽电子', // 射频、算力芯片封装，高密小型化先进封装[reference:4]
            '晶方科技', // WLP晶圆级封装，图像传感器、车载芯片封装[reference:10]
            '汇成股份', // 显示驱动芯片先进封装，COG/COF封装[reference:10]
            '伟测科技', // 先进封装配套芯片测试，算力芯片测试[reference:10]
            '深南电路', // IC封装基板，FC‑BGA基板国产主力[reference:1][reference:4]
            '鼎龙股份', // 先进封装材料，RDL、抛光垫、光刻配套材料[reference:4]
            '华海诚科', // 先进封装环氧塑封料，适配HBM高算力芯片[reference:4]
            '凯格精机', // 先进封装固晶设备，Chiplet键合设备[reference:4]
            '康强电子', // 引线框架，先进封装框架材料[reference:4]
            '天承科技', // ABF封装基板材料，FC‑BGA基板配套[reference:4]
            '赛微电子', // MEMS、晶圆级先进封装代工[reference:4]
            '华峰测控', // 先进封装后道测试设备[reference:10]
            '长川科技' // 先进封装后道测试设备[reference:10]
        ]
    },
    {
        name: 'AI应用',
        stocks: [
            '科大讯飞', // 星火大模型，教育、医疗、政务、车载多场景AI落地[reference:14][reference:17]
            '金山办公', // WPS AI，办公文档全链路AI，国内办公AI龙头[reference:13][reference:14]
            '昆仑万维', // 天工大模型，AI搜索、AI游戏、AIGC多应用布局[reference:16][reference:17]
            '三六零', // 360智脑，AI安全、AI搜索，政企大模型应用[reference:15][reference:17]
            '万兴科技', // C端AIGC创意软件，AI剪辑、AI绘图、AI文档，海外收入占比高[reference:12][reference:16]
            '同花顺', // AI问财，金融AI投顾、智能资讯，金融AI应用龙头[reference:15]
            '福昕软件', // PDF文档AI，文档智能解析、摘要改写，海外B端优势[reference:13][reference:14]
            '合合信息', // OCR+大模型，票据、合同、财报智能解析，B端AI应用[reference:13][reference:17]
            '用友网络', // ERP+AI智能体，企业财务供应链智能化[reference:13]
            '泛微网络', // OA协同AI，公文生成、流程智能优化，信创政企[reference:13][reference:17]
            '拓尔思', // 大模型+政务，行业知识库、政务大模型应用[reference:17]
            '光庭信息', // 车载软件AI，汽车智能座舱智驾软件定制[reference:17]
            '海天瑞声', // AI训练数据，多模态数据集，大模型训练数据服务商[reference:17]
            '虹软科技', // 计算机视觉AI，图像算法，手机车载视觉应用[reference:17]
            '当虹科技', // AI视频编解码，视频AIGC、智能处理[reference:17]
            '蓝色光标', // AI营销，AIGC营销内容生成，数字人营销[reference:17]
            '中文在线', // AIGC内容，AI小说、数字内容生成[reference:17]
            '汤姆猫', // AI交互应用，AI对话交互产品落地[reference:17]
            '赛意信息', // 工业AI，制造企业数字化、工业大模型应用[reference:17]
            '汉得信息' // 企业数字化AI，ERP实施+AI智能体[reference:17]
        ]
    },
    {
        name: '液冷服务器',
        stocks: [
            '英维克', // 冷板式液冷、CDU温控系统，全球液冷全链条全自研龙头[reference:140][reference:141][reference:142]
            '高澜股份', // 冷板+浸没式液冷双路线[reference:143][reference:144][reference:145]
            '申菱环境', // 液冷CDU、数据中心温控[reference:146][reference:147]
            '同飞股份', // 液冷温控设备[reference:148]
            '佳力图', // 机房温控、液冷改造方案[reference:149]
            '曙光数创', // 浸没式液冷（北交所）
            '中科曙光', // 整机/超节点方案[reference:150][reference:151]
            '浪潮信息', // 整机/超节点方案，液冷概念净利润冠军[reference:152][reference:153]
            '华勤技术', // 整机/超节点方案[reference:154][reference:155]
            '紫光股份', // 整机/超节点方案[reference:156]
            '中兴通讯', // 整机/超节点方案[reference:157]
            '银轮股份', // 液冷[reference:158]
            '领益智造', // 液冷[reference:159][reference:160]
            '宏盛股份' // 液冷[reference:161]
        ]
    },
    {
        name: '机器人',
        stocks: [
            '绿的谐波', // 谐波减速器龙头（人形机器人核心）[reference:162][reference:163][reference:164]
            '双环传动', // RV减速器[reference:165][reference:166]
            '中大力德', // 谐波+RV减速器[reference:167]
            '丰立智能', // 微型精密减速器
            '鸣志电器', // 伺服电机、运动控制器[reference:168][reference:169]
            '兆威机电', // 执行器和电机[reference:170][reference:171][reference:172]
            '恒立液压', // 丝杠类[reference:173][reference:174][reference:175]
            '长盈精密', // 关节铰链[reference:176][reference:177][reference:178]
            '埃斯顿', // 机器人本体[reference:179][reference:180]
            '优必选', // 机器人整机[reference:181][reference:182][reference:183]
            '安培龙', // 传感器[reference:184][reference:185][reference:186]
            '伟创电气', // 执行器和电机[reference:187][reference:188]
            '步科股份', // 执行器和电机[reference:189][reference:190][reference:191]
            '科达利', // 减速器[reference:192][reference:193]
            '蓝黛科技', // 减速器[reference:194]
            '豪能股份', // 减速器[reference:195]
            '瑞迪智驱', // 减速器[reference:196]
            '贝斯特', // 丝杠类[reference:197]
            '北特科技', // 丝杠类[reference:198]
            '双林股份', // 丝杠类[reference:199]
            '震裕科技', // 丝杠类[reference:200]
            '浙江荣泰', // 丝杠类[reference:201][reference:202]
            '汉威科技', // 传感器[reference:203]
            '东华测试', // 传感器[reference:204]
            '峰岹科技', // 编码器[reference:205][reference:206]
            '奥比中光', // 机器人视觉[reference:207][reference:208]
            '博众精工', // 设备类[reference:209]
            '科瑞技术', // 设备类[reference:210]
            '杭叉集团', // 机器人整机[reference:211][reference:212][reference:213]
            '卧安机器人', // 机器人整机[reference:214][reference:215][reference:216]
            '极智嘉', // 机器人整机[reference:217][reference:218]
            '宁波东力' // 机器人相关[reference:219][reference:220]
        ]
    },
    {
        name: '自动驾驶',
        stocks: [
            '德赛西威', // 智驾域控制器绝对龙头，英伟达Orin/Thor核心合作伙伴，舱驾一体大规模量产,
            '中科创达', // 车载操作系统、智驾中间件，软件定义汽车核心供应商，适配L3/L4方案,
            '经纬恒润', // 域控制器、车载软件，乘用车+商用车双线布局，L3域控已量产,
            '华阳集团', // 高性价比智驾域控方案，下沉车企客户放量，HUD+域控协同发展,
            '光庭信息', // 智驾软件定制开发，车企算法适配、座舱融合开发服务提供商,
            '四维图新', // 高精地图+定位，L3法规必备地图供应商，车路协同定位方案,
            '均胜电子', // 全球化Tier1，智驾域控配套，海外主流车企定点订单丰富,
            '中国汽研', // 自动驾驶第三方检测认证，强制国标参编单位，L3整车测试验证
            '禾赛科技', // 固态激光雷达龙头，AT128大规模前装量产，多家L3车型定点,
            '炬光科技', // 激光雷达发射模组，激光雷达上游光芯片模组核心厂商,
            '永新光学', // 激光雷达光学镜头、光学元器件，国内车载光学部件主力供应商,
            '万集科技', // 车规+路侧激光雷达，兼顾乘用车与车路协同路侧感知设备,
            '联创电子', // 车载镜头、激光雷达光学模组，进入华为、理想、比亚迪供应链,
            '韦尔股份', // 车载CIS图像传感器，车载视觉芯片龙头，多车企定点供货,
            '豪恩汽电', // DMS驾驶员监测系统、毫米波雷达，L3驾驶人接管监测硬件,
            '星网宇达', // 高精度IMU惯导单元，高阶智驾定位冗余硬件，Robotaxi刚需部件,
            '华测导航', // 车载北斗高精度定位模组，自动驾驶卫星定位硬件供应商,
            '水晶光电', // 车载光学滤光片，摄像头、激光雷达配套光学元器件
            '伯特利', // 线控制动龙头，双备份制动冗余方案，L3及以上车型安全标配,
            '拓普集团', // 线控转向、全套底盘执行机构，绑定特斯拉、赛力斯等车企,
            '耐世特', // 线控转向系统，全球底盘Tier1，高阶智驾转向冗余方案,
            '亚太股份', // 线控制动、底盘电控，国内较早布局线控底盘零部件厂商,
            '浙江世宝', // 汽车转向系统，布局线控转向零部件，国内转向零部件厂商,
            '万安科技', // 底盘制动电控，线控制动相关零部件配套
            '紫光国微', // 车规安全芯片，自动驾驶信息安全加密芯片国产替代主力,
            '瑞芯微', // 车规SoC芯片，智驾与座舱芯片实现上车量产,
            '芯原股份', // 车规芯片IP授权，为智驾芯片厂商提供IP服务支持,
            '电科网安' // 车联网信息安全，V2X数字证书、车‑路‑云全链路加密防护
        ]
    },
    {
        name: '培育钻石',
        stocks: [
            '力量钻石', // HPHT培育钻石龙头，布局CVD工业金刚石[reference:221][reference:222]
            '中兵红箭', // 中南钻石，培育钻石+工业金刚石[reference:223]
            '黄河旋风', // HPHT+CVD双线，工业金刚石热沉片，国内超硬材料龙头[reference:224][reference:225]
            '四方达', // CVD金刚石散热材料[reference:226][reference:227]
            '惠丰钻石', // 培育钻石[reference:228][reference:229][reference:230]
            '奔朗新材', // 培育钻石[reference:231]
            '沃尔德', // 培育钻石[reference:232][reference:233]
            '博云新材', // 培育钻石[reference:234]
            '国机精工', // 培育钻石[reference:235]
            '恒林股份', // 培育钻石[reference:236]
            '曼卡龙', // 培育钻石[reference:237]
            '恒盛能源', // 培育钻石[reference:238]
            '英诺激光' // 培育钻石[reference:239]
        ]
    },
    {
        name: '稀有金属',
        stocks: [
            '云南锗业', // 金属锗、磷化铟衬底[reference:240][reference:241][reference:242]
            '驰宏锌锗', // 锗原料资源
            '北方稀土', // 轻稀土龙头[reference:243][reference:244][reference:245]
            '中国稀土', // 中重稀土整合平台[reference:246][reference:247]
            '盛和资源', // 稀土冶炼分离、稀土回收
            '金钼股份', // 钼资源、高纯钼靶材原料
            '洛阳钼业', // 稀有金属龙头[reference:248][reference:249][reference:250]
            '华友钴业', // 钴资源龙头[reference:251][reference:252][reference:253]
            '赣锋锂业', // 锂资源龙头[reference:254][reference:255][reference:256]
            '天齐锂业', // 锂资源龙头[reference:257][reference:258][reference:259]
            '盐湖股份', // 盐湖资源[reference:260][reference:261][reference:262]
            '中钨高新', // 钨资源[reference:263][reference:264][reference:265]
            '厦门钨业', // 钨资源[reference:266][reference:267][reference:268]
            '中矿资源', // 稀有金属[reference:269][reference:270]
            '天华新能', // 稀有金属[reference:271][reference:272]
            '东方钽业', // 钽资源[reference:273]
            '铂科新材', // 稀有金属[reference:274]
            '西部超导' // 稀有金属[reference:275]
        ]
    },
    {
        name: '创新药',
        stocks: [
            '恒瑞医药', // A股创新药龙头，肿瘤、自免、ADC、GLP‑1全管线布局，一类新药数量国内领先,
            '百济神州', // 全球化创新药，BTK抑制剂出海，血液瘤领域实力突出,
            '荣昌生物', // ADC药物龙头，国产首款ADC维迪西妥单抗，海外授权成果显著,
            '科伦药业', // 传统输液转型创新，科伦博泰ADC管线密集，多次大额海外授权,
            '艾力斯', // 肺癌靶向药，三代EGFR伏美替尼，非小细胞肺癌赛道,
            '君实生物', // PD‑1、双抗，大分子创新药，肿瘤免疫治疗管线丰富,
            '诺诚健华', // BTK抑制剂，自身免疫、肿瘤领域创新药,
            '海思科', // 仿创结合，麻醉、代谢、肝病创新药管线,
            '信立泰', // 心脑血管创新药，小分子创新转型,
            '三生国健', // 大分子单抗，自身免疫疾病生物药,
            '百利天恒', // 双抗/ADC前沿技术平台，多候选药物进入临床阶段,
            '药明康德', // CXO全产业链，创新药研发生产外包全球龙头,
            '康龙化成', // CXO，药物发现、临床前、大分子CDMO一体化,
            '凯莱英', // CDMO，小分子、多肽、合成生物原料药代工龙头,
            '泰格医药', // CRO，临床试验服务龙头，覆盖全球多区域临床,
            '昭衍新药', // 临床前安评，药物安全性评价核心企业,
            '美迪西', // 药物发现CRO，临床前药理毒理研究,
            '博腾股份', // CDMO，小分子创新药原料药工艺开发生产,
            '康缘药业', // 中药创新药，经典名方现代化改良,
            '以岭药业' // 中药创新药，络病理论，呼吸、慢病中药新药管线
        ]
    }
];

function deduplicateSectorStocks(concepts) {
    return concepts.map(concept => {
        const seen = new Set();
        const uniqueStocks = concept.stocks.filter(name => {
            if (seen.has(name)) {
                return false;
            }
            seen.add(name);
            return true;
        });

        return {
            ...concept,
            stocks: uniqueStocks
        };
    });
}

const innerConcepts = deduplicateSectorStocks(concepts);

export const conceptSectors = innerConcepts;