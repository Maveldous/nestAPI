import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import PostsController from './posts.controller';
import Post from './post.entity';
import PostsService from './posts.service';
import { SearchModule } from 'src/search/search.module';
import PostsSearchService from './postsSearch.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), SearchModule],
  controllers: [PostsController],
  providers: [PostsService, PostsSearchService],
})
export class PostsModule {}
