import { Movie } from '@/types';

/**
 * Records a movie play into Continue Watching.
 * Continue Watching is initialized empty for every new user,
 * and only populates when a user explicitly clicks "Play" on a title.
 */
export const recordMoviePlay = (movie: Movie | { id: string | number; title: string }) => {
  try {
    const idStr = String(movie.id);
    const titleStr = movie.title.toLowerCase().trim();

    // 1. Retrieve existing active Continue Watching IDs
    const saved = localStorage.getItem('zhoosh_active_cw_ids');
    const list: string[] = saved ? JSON.parse(saved) : [];

    // 2. Prepend movie id (remove any prior instance to move to front)
    const nextList = [
      idStr,
      ...list.filter((x) => x !== idStr && x !== titleStr && x !== `cw-${idStr}`)
    ];
    localStorage.setItem('zhoosh_active_cw_ids', JSON.stringify(nextList));

    // 3. Remove from removedIds if user previously dismissed it
    const removedSaved = localStorage.getItem('zhoosh_removed_cw_ids');
    if (removedSaved) {
      const removedList: string[] = JSON.parse(removedSaved);
      const nextRemoved = removedList.filter(
        (x) => x !== idStr && x !== titleStr && x !== `cw-${idStr}`
      );
      localStorage.setItem('zhoosh_removed_cw_ids', JSON.stringify(nextRemoved));
    }

    // 4. Dispatch live event so ContinueWatchingShelf reacts instantly
    window.dispatchEvent(new CustomEvent('zhoosh:cw-updated', { detail: { movieId: idStr } }));
  } catch {}
};
