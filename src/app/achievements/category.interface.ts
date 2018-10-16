import { DocumentReference } from '@firebase/firestore-types';
import { Observable } from 'rxjs';

import { Achievement } from './achievement.interface';

export interface Category {
  achievements?: DocumentReference[];
  categories?: DocumentReference[];
  id: string;
  name: string;
  reference: DocumentReference;
  slug: string;
  types: Array<'rs' | 'tt'>;

  // Own fields
  achievements$: Observable<Achievement[]>;
  categories$: Observable<Category[]>;
}
