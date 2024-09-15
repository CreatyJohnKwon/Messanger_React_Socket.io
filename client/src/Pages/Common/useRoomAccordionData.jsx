import  { GlobalStore }  from "../../Store/Store";

const useRoomAccordionData = () => {
  const { depts, members } = GlobalStore();

  const companies = [{ COM_NM: "나의 회사" }];

  const countOnlineMembers = (deptNm, membersList) =>
    membersList.filter((member) => member.deptNm === deptNm && member.isOline)
      .length;

  const countTotalMembers = (deptNm, membersList) =>
    membersList.filter((member) => member.deptNm === deptNm).length;

  const createDataForCheckList = (deptNm, membersList) => {
    const result = {};

    membersList
      .filter((member) => member.deptNm === deptNm)
      .forEach((member) => {
        if (!result[member.component]) {
          result[member.component] = {
            componentName: member.component,
            employeeData: [],
          };
        }

        result[member.component].employeeData.push(member);
      });

    return Object.values(result);
  };

  const createNestedAccordionData = (company, departmentsList, membersList) => {
    return {
      index: (
        companies.findIndex((c) => c.COM_NM === company.COM_NM) + 1
      ).toString(),
      categoryName: company.COM_NM,
      currentTotalOnlinedCount: 0,
      groupTotalMember: membersList.length,
      subCategoryContent: departmentsList.map((dept, deptIndex) => ({
        index: `${
          companies.findIndex((c) => c.COM_NM === company.COM_NM) + 1
        }-${deptIndex + 1}`,
        teamName: dept.DEPT_NM,
        currentOnlinedCount: countOnlineMembers(dept.DEPT_NM, membersList),
        teamTotalMember: countTotalMembers(dept.DEPT_NM, membersList),
        membersToGroup: createDataForCheckList(dept.DEPT_NM, membersList),
      })),
    };
  };

  const nestedAccordionData = [
    createNestedAccordionData(companies[0], depts, members),
    // createNestedAccordionData(companies[1], departments2, members2),
  ];

  nestedAccordionData.forEach((data) => {
    data.currentTotalOnlinedCount = data.subCategoryContent.reduce(
      (sum, item) => sum + item.currentOnlinedCount,
      0
    );
  });

  return { nestedAccordionData };
}

export default useRoomAccordionData;
