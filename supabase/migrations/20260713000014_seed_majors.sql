-- Migration #14 (seed): 39 ngành học chuẩn — bản địa hóa danh mục Capstone/ApplyBoard
-- ============================================================================
-- Nạp danh mục majors (migration #13). Idempotent: on conflict slug do nothing —
-- chạy lại không nhân bản, không đè tên đã sửa tay.
-- category = nhóm hiển thị <optgroup> ở dropdown /tim-truong + SchoolFinder.

insert into public.majors (slug, name_vi, name_en, category) values
  -- ── Kinh doanh & Quản lý ──
  ('business-administration', 'Quản trị Kinh doanh',            'Business Administration',                  'Kinh doanh & Quản lý'),
  ('accounting',             'Kế toán',                          'Accounting',                               'Kinh doanh & Quản lý'),
  ('finance-banking',        'Tài chính - Ngân hàng',            'Finance and Banking',                      'Kinh doanh & Quản lý'),
  ('marketing',              'Marketing',                        'Marketing',                                'Kinh doanh & Quản lý'),
  ('international-business',  'Kinh doanh Quốc tế',               'International Business',                    'Kinh doanh & Quản lý'),
  ('economics',              'Kinh tế học',                      'Economics',                                'Kinh doanh & Quản lý'),
  ('logistics-supply-chain', 'Logistics & Quản lý Chuỗi cung ứng','Logistics and Supply Chain Management',    'Kinh doanh & Quản lý'),
  ('hospitality-tourism',    'Quản trị Khách sạn & Du lịch',      'Hotel Management and Tourism',             'Kinh doanh & Quản lý'),
  -- ── Kỹ thuật & Công nghệ ──
  ('computer-science',       'Khoa học Máy tính',                'Computer Science',                         'Kỹ thuật & Công nghệ'),
  ('engineering',            'Kỹ thuật',                         'Engineering',                              'Kỹ thuật & Công nghệ'),
  ('petroleum-engineering',  'Kỹ thuật Dầu khí',                 'Petroleum Engineering',                    'Kỹ thuật & Công nghệ'),
  ('architecture',           'Kiến trúc',                        'Architecture',                             'Kỹ thuật & Công nghệ'),
  ('aviation',               'Hàng không',                       'Aviation',                                 'Kỹ thuật & Công nghệ'),
  -- ── Khoa học Tự nhiên ──
  ('biology',                'Sinh học',                         'Biology',                                  'Khoa học Tự nhiên'),
  ('chemistry',              'Hóa học',                          'Chemistry',                                'Khoa học Tự nhiên'),
  ('physics',                'Vật lý',                           'Physics',                                  'Khoa học Tự nhiên'),
  ('mathematics-statistics', 'Toán & Thống kê',                  'Mathematics/Statistics',                   'Khoa học Tự nhiên'),
  ('biochemistry',           'Hóa sinh',                         'Biochemistry',                             'Khoa học Tự nhiên'),
  -- ── Khoa học Sức khỏe & Y ──
  ('medicine',               'Y khoa',                           'Medicine',                                 'Khoa học Sức khỏe & Y'),
  ('nursing',                'Điều dưỡng',                       'Nursing',                                  'Khoa học Sức khỏe & Y'),
  ('pharmacy',               'Dược học',                         'Pharmacy',                                 'Khoa học Sức khỏe & Y'),
  ('health-science',         'Khoa học Sức khỏe',                'Health Science',                           'Khoa học Sức khỏe & Y'),
  ('psychology',             'Tâm lý học',                       'Psychology',                               'Khoa học Sức khỏe & Y'),
  -- ── Khoa học Xã hội & Nhân văn ──
  ('international-relations', 'Quan hệ Quốc tế',                  'International Relations',                  'Khoa học Xã hội & Nhân văn'),
  ('political-science',      'Khoa học Chính trị',               'Political Science',                        'Khoa học Xã hội & Nhân văn'),
  ('sociology',              'Xã hội học',                       'Sociology',                                'Khoa học Xã hội & Nhân văn'),
  ('history',                'Lịch sử',                          'History',                                  'Khoa học Xã hội & Nhân văn'),
  ('philosophy',             'Triết học',                        'Philosophy',                               'Khoa học Xã hội & Nhân văn'),
  ('law',                    'Luật',                             'Laws and Legal Studies',                   'Khoa học Xã hội & Nhân văn'),
  -- ── Giáo dục ──
  ('education',              'Giáo dục học',                     'Education',                                'Giáo dục'),
  ('tesol',                  'Giảng dạy tiếng Anh (TESOL)',      'Teaching English as a Second Language',    'Giáo dục'),
  -- ── Truyền thông & Báo chí ──
  ('communications',         'Truyền thông',                     'Communications',                           'Truyền thông & Báo chí'),
  ('journalism',             'Báo chí',                          'Journalism',                               'Truyền thông & Báo chí'),
  -- ── Nghệ thuật & Thiết kế ──
  ('graphic-design',         'Thiết kế Đồ họa',                  'Graphic Design',                           'Nghệ thuật & Thiết kế'),
  ('fashion-design',         'Thiết kế Thời trang',              'Fashion Design',                           'Nghệ thuật & Thiết kế'),
  ('film-media-studies',     'Điện ảnh & Truyền thông',          'Film/Media Studies',                       'Nghệ thuật & Thiết kế'),
  ('music',                  'Âm nhạc',                          'Music',                                    'Nghệ thuật & Thiết kế'),
  -- ── Nông nghiệp & Môi trường ──
  ('agriculture',            'Nông nghiệp',                      'Agriculture',                              'Nông nghiệp & Môi trường'),
  ('environmental-science',  'Khoa học Môi trường',              'Environmental Science',                    'Nông nghiệp & Môi trường')
on conflict (slug) do nothing;
