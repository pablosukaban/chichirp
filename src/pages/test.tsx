// import { api } from '~/utils/api';

// const test = () => {
//     const { data, fetchNextPage } = api.posts.getInfinitePosts.useInfiniteQuery(
//         {
//             limit: 5,
//         },
//         {
//             getNextPageParam: (lastPage) => {
//                 return lastPage.nextCursor;
//             },
//         },
//     );

//     const show = data?.pages[0]?.posts;
//     console.log('🚀 ~ file: test.tsx:16 ~ test ~ show:', show);

//     // const loadMore = () => {
//     //     void fetchNextPage();
//     // };

//     return (
//         <div>
//             {/* {data?.pages.map((page) => (
//                 <div key={page.nextCursor}>
//                     {page.posts.map((post) => (
//                         <div key={post.id} className="mb-2">
//                             {post.content}
//                         </div>
//                     ))}
//                 </div>
//             ))}
//             <button onClick={loadMore}>Load more</button> */}
//         </div>
//     );
// };

// export default test;

export default function Page() {
    return <h1>test</h1>;
}
