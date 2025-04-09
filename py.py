class Node(): 
    def __init__(self):
        self.data = None
        self.link = None
        
def printNodes(start):
    current = start
    if current == None:
        return
    print(current.data, end=' ')
    while current.link != None:
        current = current.link
        print(current.data, end=' ')
    print()

def insertNode(findData, insertData):
    global head, current, pre

    # head가 찾는 데이터와 일치할 때
    if head.data == findData:
        node = Node()
        node.data = insertData
        node.link = head
        head = node
        return
    
    current = head
    while current.link != None:
        pre = current
        current = current.link
    if current.data == findData:
        node = Node()
        node.data = insertData
        node.link = current
        pre.link = node
        return

    # 찾는 데이터가 없으면 마지막에 "렌트" 추가
    node = Node()
    node.data = insertData
    current.link = node

memory = []
head, current, pre = None, None, None
dataArray = ["다현", "정연", "재남", "쯔위"]

if __name__ == "__main__":

    # 첫 번째 노드 생성
    node = Node()
    node.data = dataArray[0]
    head = node
    memory.append(node)

    # 나머지 노드 연결
    for data in dataArray[1:]:
        pre = node
        node = Node()
        node.data = data
        pre.link = node
        memory.append(node)

    # 마지막 노드까지 찾고, 없으면 새 노드를 추가
    new_node = Node()
    new_node.data = "렌트"
    current = head

    # 마지막 노드까지 탐색
    while current.link is not None:
        current = current.link

    # 새 노드("렌트") 추가
    current.link = new_node

    # 결과 출력
    printNodes(head)

