import { typeOrmConfigs } from 'src/config/db-config';
import { DataSource } from 'typeorm';

export default new DataSource(typeOrmConfigs());
