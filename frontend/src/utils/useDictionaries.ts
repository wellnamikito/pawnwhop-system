import { useEffect, useState } from "react";
import {
  districtApi,
  ownerTypeApi,
  ownershipTypeApi,
  pledgeItemTypeApi,
  socialStatusApi,
} from "@/api/endpoints";
import type { District, OwnerType, OwnershipType, PledgeItemType, SocialStatus } from "@/types";

export function useDictionaries() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [ownerTypes, setOwnerTypes] = useState<OwnerType[]>([]);
  const [ownershipTypes, setOwnershipTypes] = useState<OwnershipType[]>([]);
  const [itemTypes, setItemTypes] = useState<PledgeItemType[]>([]);
  const [socialStatuses, setSocialStatuses] = useState<SocialStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      districtApi.list(),
      ownerTypeApi.list(),
      ownershipTypeApi.list(),
      pledgeItemTypeApi.list(),
      socialStatusApi.list(),
    ])
      .then(([d, ot, own, it, ss]) => {
        setDistricts(d);
        setOwnerTypes(ot);
        setOwnershipTypes(own);
        setItemTypes(it);
        setSocialStatuses(ss);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    districts,
    ownerTypes,
    ownershipTypes,
    itemTypes,
    socialStatuses,
    loading,
    options: {
      districts: districts.map((d) => ({ value: d.district_id, label: d.district_name })),
      ownerTypes: ownerTypes.map((o) => ({ value: o.owner_type_id, label: o.type_name })),
      ownershipTypes: ownershipTypes.map((o) => ({ value: o.ownership_type_id, label: o.type_name })),
      itemTypes: itemTypes.map((i) => ({ value: i.item_type_id, label: i.type_name })),
      socialStatuses: socialStatuses.map((s) => ({ value: s.social_status_id, label: s.status_name })),
    },
  };
}
