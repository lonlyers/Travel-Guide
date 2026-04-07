-- 旅游打卡攻略系统数据库初始化脚本
-- Travel Guide Database Setup Script

CREATE DATABASE IF NOT EXISTS travel_guide CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE travel_guide;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 城市表
CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 景点表
CREATE TABLE IF NOT EXISTS attractions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  address VARCHAR(500),
  FOREIGN KEY (city_id) REFERENCES cities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 攻略表
CREATE TABLE IF NOT EXISTS guides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  city_id INT NOT NULL,
  visibility ENUM('public', 'private') DEFAULT 'private',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (city_id) REFERENCES cities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 攻略景点关联表（包含顺序、照片和评论）
CREATE TABLE IF NOT EXISTS guide_attractions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guide_id INT NOT NULL,
  attraction_id INT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  photo_url VARCHAR(500),
  comment TEXT,
  FOREIGN KEY (guide_id) REFERENCES guides(id) ON DELETE CASCADE,
  FOREIGN KEY (attraction_id) REFERENCES attractions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 种子数据：城市
INSERT INTO cities (name, description, image_url) VALUES
('北京', '中国的首都，拥有丰富的历史和文化遗产', 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800'),
('上海', '国际化大都市，融合了东西方文化', 'https://images.unsplash.com/photo-1474181628-5e4054192b8b?w=800'),
('成都', '天府之国，以美食和大熊猫闻名', 'https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=800'),
('西安', '十三朝古都，拥有世界闻名的兵马俑', 'https://images.unsplash.com/photo-1556813544-8dd2a8e64e78?w=800'),
('杭州', '人间天堂，以西湖美景著称', 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=800'),
('广州', '花城，岭南文化的中心', 'https://images.unsplash.com/photo-1583996746515-eb77f9b7250b?w=800');

-- 种子数据：景点
INSERT INTO attractions (city_id, name, description, address) VALUES
-- 北京
(1, '故宫', '中国明清两代的皇家宫殿，世界上现存规模最大的宫殿型建筑', '北京市东城区景山前街4号'),
(1, '长城(八达岭)', '世界文化遗产，中华民族的象征', '北京市延庆区八达岭镇'),
(1, '天坛', '明清两代皇帝祭天的场所', '北京市东城区天坛内东里7号'),
(1, '颐和园', '中国古典园林之首，皇家园林博物馆', '北京市海淀区新建宫门路19号'),
(1, '天安门广场', '世界上最大的城市广场', '北京市东城区东长安街'),
-- 上海
(2, '外滩', '上海的标志性景观，万国建筑博览群', '上海市黄浦区中山东一路'),
(2, '东方明珠', '上海地标性建筑，广播电视塔', '上海市浦东新区世纪大道1号'),
(2, '豫园', '江南古典园林，有四百多年历史', '上海市黄浦区安仁街218号'),
(2, '南京路步行街', '中华商业第一街', '上海市黄浦区南京东路'),
(2, '迪士尼乐园', '中国大陆首座迪士尼主题乐园', '上海市浦东新区川沙镇'),
-- 成都
(3, '大熊猫繁育研究基地', '世界著名的大熊猫保护研究中心', '成都市成华区外北熊猫大道1375号'),
(3, '宽窄巷子', '成都最具代表性的历史文化街区', '成都市青羊区同仁路以东长顺街以南'),
(3, '锦里', '成都最古老的商业街之一', '成都市武侯区武侯祠大街231号'),
(3, '都江堰', '世界文化遗产，古代水利工程', '成都市都江堰市公园路'),
(3, '武侯祠', '中国唯一的君臣合祀祠庙', '成都市武侯区武侯祠大街231号'),
-- 西安
(4, '秦始皇兵马俑', '世界第八大奇迹', '西安市临潼区秦陵北路'),
(4, '大雁塔', '唐代佛教建筑的杰出代表', '西安市雁塔区慈恩路1号'),
(4, '古城墙', '中国现存规模最大、保存最完整的古代城垣', '西安市碑林区南大街'),
(4, '华清宫', '以温泉汤池著称的皇家园林', '西安市临潼区华清路38号'),
(4, '回民街', '西安著名的美食文化街区', '西安市莲湖区北院门'),
-- 杭州
(5, '西湖', '世界文化遗产，杭州的名片', '杭州市西湖区龙井路1号'),
(5, '灵隐寺', '江南著名古刹之一', '杭州市西湖区灵隐路法云弄1号'),
(5, '千岛湖', '国家5A级旅游景区', '杭州市淳安县千岛湖镇'),
(5, '宋城', '大型宋代文化主题公园', '杭州市西湖区之江路148号'),
(5, '雷峰塔', '西湖十景之一', '杭州市西湖区南山路15号'),
-- 广州
(6, '广州塔', '广州新地标，小蛮腰', '广州市海珠区阅江西路222号'),
(6, '陈家祠', '岭南建筑艺术的明珠', '广州市荔湾区中山七路'),
(6, '白云山', '南粤名山之一', '广州市白云区广园中路801号'),
(6, '沙面岛', '欧陆风情的历史文化街区', '广州市荔湾区沙面北街'),
(6, '长隆野生动物世界', '世界级的野生动物旅游度假区', '广州市番禺区大石街道');
