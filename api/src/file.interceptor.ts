import { FileInterceptor } from '@nestjs/platform-express';

import { multerOptions } from './multer.options';

export default FileInterceptor('file', multerOptions);
