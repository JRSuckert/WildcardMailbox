package storage

import (
	"bytes"
	"fmt"
	"os"
	"strings"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

type Mailbox struct {
	Mails []string
}

func ListObjects() {
	sess := session.Must(session.NewSession())

	client := s3.New(sess)

	i := 0
	bucket := os.Getenv("BUCKET_NAME")
	box := make(map[string]Mailbox)
	err := client.ListObjectsPages(&s3.ListObjectsInput{
		Bucket: &bucket,
	}, func(p *s3.ListObjectsOutput, last bool) (shouldContinue bool) {
		fmt.Println("Page,", i)
		i++

		for _, obj := range p.Contents {
			mailbox := strings.SplitAfterN(*obj.Key, "/", 2)
			if val, ok := box[mailbox[0]]; ok {
				val.Mails = append(val.Mails, mailbox[1])
			} else {
				temp := Mailbox{
					Mails: []string{mailbox[1]},
				}
				box[mailbox[0]] = temp
			}
		}
		return true
	})
	if err != nil {
		fmt.Println("failed to list objects", err)
		return
	}

	joinedKey := ""
	for key, element := range box {
		fmt.Println(key, element)
		joinedKey = strings.Join([]string{key, element.Mails[0]}, "")
	}

	obj, err := client.GetObject(&s3.GetObjectInput{
		Bucket: &bucket,
		Key:    &joinedKey,
	})

	if err == nil {
		buf := new(bytes.Buffer)
		buf.ReadFrom(obj.Body)
		newStr := buf.String()

		fmt.Printf(newStr)
	}

}
