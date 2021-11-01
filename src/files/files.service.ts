import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import PublicFile from './publicFile.entity';

@Injectable()
export class FilesService {
  private s3Client: S3Client;

  constructor(
    @InjectRepository(PublicFile)
    private publicFileRepository: Repository<PublicFile>,
    private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  public async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    const key = `${uuid()}-${filename}`;
    const url = `https://${this.configService.get(
      'AWS_PUBLIC_BUCKET_NAME',
    )}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
    const params = {
      Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
      Key: key,
      Body: dataBuffer,
    };

    await this.s3Client.send(new PutObjectCommand(params));

    const newFile = this.publicFileRepository.create({
      key,
      url,
    });

    await this.publicFileRepository.save(newFile);
    return newFile;
  }

  public async deletePublicFile(fileId: number) {
    const file = await this.publicFileRepository.findOne({
      id: fileId,
    });

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Key: file.key,
      }),
    );

    await this.publicFileRepository.delete(fileId);
  }
}
