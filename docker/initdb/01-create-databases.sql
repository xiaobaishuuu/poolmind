-- Postgres 实例首次启动时自动执行（docker-entrypoint-initdb.d）。
-- POSTGRES_DB 已经建好 poolmind_dev，这里补建独立的测试库 poolmind_test。
-- 两个库物理隔离：跑测试清空 poolmind_test，绝不影响 poolmind_dev 里手动录入的数据。
-- 注意：poolmind_production 是 AWS RDS 上的独立真机，不在本地、也永远不由本脚本创建。
CREATE DATABASE poolmind_test;
GRANT ALL PRIVILEGES ON DATABASE poolmind_test TO poolmind;
